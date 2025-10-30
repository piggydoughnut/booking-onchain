// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { Ownable } from "./lib/Ownable.sol";
import { IListingManager } from "./interfaces/IListingManager.sol";

contract ListingManager is Ownable, IListingManager {
    struct Listing {
        address owner;
        uint256 pricePerHour; // in wei (native PAS)
        string metadataCID; // IPFS CID
        bool active;
    }

    struct Interval { uint64 startTs; uint64 endTs; }

    // listingId => listing
    mapping(uint256 => Listing) private listings;
    // listingId => booked intervals
    mapping(uint256 => Interval[]) private bookedIntervals;
    uint256 public nextListingId = 1;
    address public bookingManager; // trusted

    event BookingManagerUpdated(address bookingManager);
    event ListingCreated(uint256 indexed listingId, address indexed owner, uint256 pricePerHour, string cid);
    event ListingUpdated(uint256 indexed listingId);
    event IntervalBlocked(uint256 indexed listingId, uint64 startTs, uint64 endTs);

    modifier onlyBookingManager() {
        require(msg.sender == bookingManager, "not booking mgr");
        _;
    }

    function setBookingManager(address mgr) external onlyOwner {
        require(mgr != address(0), "mgr=0");
        bookingManager = mgr;
        emit BookingManagerUpdated(mgr);
    }

    function createListing(uint256 pricePerHour, string calldata metadataCID) external returns (uint256 listingId) {
        require(pricePerHour > 0, "price=0");
        listingId = nextListingId++;
        listings[listingId] = Listing({
            owner: msg.sender,
            pricePerHour: pricePerHour,
            metadataCID: metadataCID,
            active: true
        });
        emit ListingCreated(listingId, msg.sender, pricePerHour, metadataCID);
    }

    function updateListing(uint256 listingId, uint256 pricePerHour, string calldata metadataCID, bool active) external {
        Listing storage l = listings[listingId];
        require(l.owner == msg.sender, "not owner");
        require(pricePerHour > 0, "price=0");
        l.pricePerHour = pricePerHour;
        l.metadataCID = metadataCID;
        l.active = active;
        emit ListingUpdated(listingId);
    }

    function getListingOwner(uint256 listingId) external view override returns (address) { return listings[listingId].owner; }
    function getListingPricePerHour(uint256 listingId) external view override returns (uint256) { return listings[listingId].pricePerHour; }
    function getListing(uint256 listingId) external view override returns (address owner, uint256 pricePerHour, string memory metadataCID, bool active) {
        Listing storage l = listings[listingId];
        return (l.owner, l.pricePerHour, l.metadataCID, l.active);
    }

    function isAvailable(uint256 listingId, uint64 startTs, uint64 endTs) public view override returns (bool) {
        require(startTs < endTs, "bad interval");
        Listing storage l = listings[listingId];
        require(l.active, "inactive");
        Interval[] storage arr = bookedIntervals[listingId];
        for (uint256 i = 0; i < arr.length; i++) {
            // overlap if start < existing.end && end > existing.start
            if (startTs < arr[i].endTs && endTs > arr[i].startTs) {
                return false;
            }
        }
        return true;
    }

    function blockInterval(uint256 listingId, uint64 startTs, uint64 endTs) external override onlyBookingManager {
        require(isAvailable(listingId, startTs, endTs), "not available");
        bookedIntervals[listingId].push(Interval({ startTs: startTs, endTs: endTs }));
        emit IntervalBlocked(listingId, startTs, endTs);
    }

    function getBookedIntervals(uint256 listingId) external view returns (Interval[] memory) {
        return bookedIntervals[listingId];
    }
}


