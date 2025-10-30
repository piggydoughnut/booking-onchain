// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IAccessNFT {
    function mintAccess(address to, uint256 tokenId, uint64 expiresAt, string calldata tokenURI_) external;
    function burn(uint256 tokenId) external;
    function accessExpiry(uint256 tokenId) external view returns (uint64);
}


