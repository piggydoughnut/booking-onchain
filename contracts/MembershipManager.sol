// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { Ownable } from "./lib/Ownable.sol";
import { IMembershipManager } from "./interfaces/IMembershipManager.sol";

contract MembershipManager is Ownable, IMembershipManager {
    struct Plan {
        uint256 pricePerPeriod; // in smallest unit of acceptedToken (e.g., DOT XC-20)
        uint64 durationPerPeriod; // seconds per period (e.g., 30 days)
        bool active;
    }

    Plan public plan;

    mapping(address => uint64) public membershipExpiresAt;

    event PlanUpdated(uint256 pricePerPeriod, uint64 durationPerPeriod, bool active);
    event MembershipPurchased(address indexed account, uint64 newExpiry, uint256 periodsPaid, uint256 amountWei);

    constructor(uint256 pricePerPeriod, uint64 durationPerPeriodSeconds) {
        require(durationPerPeriodSeconds > 0, "duration=0");
        plan = Plan({ pricePerPeriod: pricePerPeriod, durationPerPeriod: durationPerPeriodSeconds, active: true });
        emit PlanUpdated(pricePerPeriod, durationPerPeriodSeconds, true);
    }

    function updatePlan(uint256 pricePerPeriod, uint64 durationPerPeriodSeconds, bool active) external onlyOwner {
        require(durationPerPeriodSeconds > 0, "duration=0");
        plan = Plan({ pricePerPeriod: pricePerPeriod, durationPerPeriod: durationPerPeriodSeconds, active: active });
        emit PlanUpdated(pricePerPeriod, durationPerPeriodSeconds, active);
    }

    function becomeMember() external payable {
        _purchase(msg.sender, msg.value);
    }

    function renewMembership(address account) external payable {
        _purchase(account, msg.value);
    }

    function isMember(address account) external view override returns (bool) {
        return membershipExpiresAt[account] >= uint64(block.timestamp);
    }

    function _purchase(address account, uint256 paymentAmount) internal {
        require(plan.active, "plan inactive");
        require(paymentAmount >= plan.pricePerPeriod, "insufficient amount");

        uint256 periods = paymentAmount / plan.pricePerPeriod;
        uint64 added = uint64(periods) * plan.durationPerPeriod;
        require(added > 0, "no periods");

        uint64 current = membershipExpiresAt[account];
        uint64 base = current > uint64(block.timestamp) ? current : uint64(block.timestamp);
        uint64 newExpiry = base + added;
        membershipExpiresAt[account] = newExpiry;
        emit MembershipPurchased(account, newExpiry, periods, periods * plan.pricePerPeriod);
    }

    function withdraw(address to, uint256 amount) external onlyOwner {
        require(to != address(0), "to=0");
        (bool ok, ) = payable(to).call{ value: amount }("");
        require(ok, "transfer failed");
    }
}


