// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Test.sol";
import {FundLoom} from "../src/FundLoom.sol";

contract FundLoomLiteTest is Test {
    FundLoom fund;
    address creator = address(0xA11CE);
    address payable charity = payable(address(0xBEEF));
    address donor = address(0xD00D);

    function setUp() public {
        fund = new FundLoom();
        vm.deal(creator, 100 ether);
        vm.deal(donor, 50 ether);
    }

    function test_CreateDonateWithdraw() public {
        // Create
        vm.prank(creator);
        uint256 id = fund.createCampaign(charity, 10 ether, block.timestamp + 30 days);
        FundLoom.Campaign memory c = fund.getCampaign(id);
        assertEq(c.creator, creator);
        assertTrue(c.isActive);

        // Donate
        vm.prank(donor);
        fund.donate{value: 1 ether}(id);
        c = fund.getCampaign(id);
        assertEq(c.raisedAmount, 1 ether);
        assertEq(c.totalDonors, 1);

        // Withdraw
        uint256 beforeBal = charity.balance;
        vm.prank(creator);
        fund.withdraw(id, 0.5 ether);
        assertEq(charity.balance, beforeBal + 0.5 ether);
        c = fund.getCampaign(id);
        assertEq(c.raisedAmount, 0.5 ether);
    }
}