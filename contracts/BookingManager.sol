// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { Ownable } from "./lib/Ownable.sol";
import { IMembershipManager } from "./interfaces/IMembershipManager.sol";
import { IListingManager } from "./interfaces/IListingManager.sol";
import { IAccessNFT } from "./interfaces/IAccessNFT.sol";

contract BookingManager is Ownable {
    struct Booking {
        address renter;
        uint256 listingId;
        uint64 startTs;
        uint64 endTs;
        uint256 amount;
        bool released;
    }

    IMembershipManager public membership;
    IListingManager public listings;
    IAccessNFT public accessNft; // optional

    uint256 public nextBookingId = 1;
    mapping(uint256 => Booking) public bookings;

    event Booked(uint256 indexed bookingId, uint256 indexed listingId, address indexed renter, uint64 startTs, uint64 endTs, uint256 amountWei);
    event Released(uint256 indexed bookingId, address to, uint256 amount);
    event Refunded(uint256 indexed bookingId, address to, uint256 amount);
    event AccessNftUpdated(address nft);

    constructor(address membershipManager, address listingManager) {
        require(membershipManager != address(0) && listingManager != address(0), "addr=0");
        membership = IMembershipManager(membershipManager);
        listings = IListingManager(listingManager);
    }

    function setAccessNft(address nft) external onlyOwner {
        accessNft = IAccessNFT(nft);
        emit AccessNftUpdated(nft);
    }

    function book(uint256 listingId, uint64 startTs, uint64 endTs) external returns (uint256 bookingId) {
        require(membership.isMember(msg.sender), "not a member");
        require(startTs < endTs && endTs > uint64(block.timestamp), "bad interval");
        require(listings.isAvailable(listingId, startTs, endTs), "unavailable");
        uint256 amount = 0;

        bookingId = nextBookingId++;
        bookings[bookingId] = Booking({
            renter: msg.sender,
            listingId: listingId,
            startTs: startTs,
            endTs: endTs,
            amount: amount,
            released: false
        });

        // block interval on listings
        listings.blockInterval(listingId, startTs, endTs);

        // optional access NFT
        if (address(accessNft) != address(0)) {
            accessNft.mintAccess(msg.sender, bookingId, endTs, "");
        }

        emit Booked(bookingId, listingId, msg.sender, startTs, endTs, amount);
    }

    function release(uint256 bookingId) external {
        Booking storage b = bookings[bookingId];
        require(!b.released, "released");
        address listingOwner = listings.getListingOwner(b.listingId);
        require(msg.sender == listingOwner || msg.sender == owner(), "not owner");
        b.released = true;
        (bool ok, ) = payable(listingOwner).call{ value: b.amount }("");
        require(ok, "transfer failed");
        emit Released(bookingId, listingOwner, b.amount);
    }

    function refund(uint256 bookingId) external onlyOwner {
        Booking storage b = bookings[bookingId];
        require(!b.released, "released");
        b.released = true;
        (bool ok, ) = payable(b.renter).call{ value: b.amount }("");
        require(ok, "transfer failed");
        emit Refunded(bookingId, b.renter, b.amount);
    }
}


