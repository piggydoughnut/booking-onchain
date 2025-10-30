// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { Ownable } from "./lib/Ownable.sol";
import { IAccessNFT } from "./interfaces/IAccessNFT.sol";

// Minimal, non-transferable access token (ERC721-like), tokenId = bookingId
contract AccessNFT is Ownable, IAccessNFT {
    string public name = "Booking Access NFT";
    string public symbol = "ACCESS";

    mapping(uint256 => address) private _ownerOf;
    mapping(address => uint256) private _balanceOf;
    mapping(uint256 => string) private _tokenURI;
    mapping(uint256 => uint64) public override accessExpiry;

    event Transfer(address indexed from, address indexed to, uint256 indexed tokenId);

    function ownerOf(uint256 tokenId) public view returns (address) {
        address o = _ownerOf[tokenId];
        require(o != address(0), "not minted");
        return o;
    }

    function balanceOf(address owner) public view returns (uint256) {
        require(owner != address(0), "zero");
        return _balanceOf[owner];
    }

    function tokenURI(uint256 tokenId) public view returns (string memory) {
        require(_ownerOf[tokenId] != address(0), "not minted");
        return _tokenURI[tokenId];
    }

    function mintAccess(address to, uint256 tokenId, uint64 expiresAt, string calldata tokenURI_) external override onlyOwner {
        require(to != address(0), "to=0");
        require(_ownerOf[tokenId] == address(0), "exists");
        _ownerOf[tokenId] = to;
        _balanceOf[to] += 1;
        accessExpiry[tokenId] = expiresAt;
        _tokenURI[tokenId] = tokenURI_;
        emit Transfer(address(0), to, tokenId);
    }

    function burn(uint256 tokenId) external override {
        address o = ownerOf(tokenId);
        require(msg.sender == o || msg.sender == owner(), "not allowed");
        _balanceOf[o] -= 1;
        delete _ownerOf[tokenId];
        delete _tokenURI[tokenId];
        delete accessExpiry[tokenId];
        emit Transfer(o, address(0), tokenId);
    }

    // Non-transferable — disable transfers/approvals intentionally
}


