// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IMembershipManager {
    function isMember(address account) external view returns (bool);
}


