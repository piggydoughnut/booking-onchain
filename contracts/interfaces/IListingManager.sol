// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IListingManager {
    function getListingOwner(uint256 listingId) external view returns (address);
    function getListingPricePerHour(uint256 listingId) external view returns (uint256);
    function getListing(uint256 listingId) external view returns (address owner, uint256 pricePerHour, string memory metadataCID, bool active);
    function isAvailable(uint256 listingId, uint64 startTs, uint64 endTs) external view returns (bool);
    function blockInterval(uint256 listingId, uint64 startTs, uint64 endTs) external;
}


