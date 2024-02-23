// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;

contract StepBettingGame {
    address public admin;
    address public walkerAddress;
    address public walker;
    uint public poolBalance;
    uint public stepGoal = 1000;
    bool public goalAchieved = false;

    constructor() {
        admin = msg.sender;
        walkerAddress = 0xaC8af5ff5291134D310Bc4D516D512D0Dabe71ad;
    }

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can call this.");
        _;
    }

    modifier onlyWalker() {
        require(msg.sender == walkerAddress, "Only walker can call this.");
        _;
    }

    function addToPool() public payable onlyAdmin {
        poolBalance += msg.value;
    }

    function setWalker(address _walker) public onlyAdmin {
        walker = _walker;
    }

    function markGoalAchieved(bool _goalAchieved) public onlyWalker {
        goalAchieved = _goalAchieved;
    }

    function transferIfGoalAchieved() public onlyAdmin {
        require(goalAchieved, "Step goal not achieved yet.");
        require(poolBalance > 0, "Pool balance is zero.");

        payable(walker).transfer(poolBalance);
        goalAchieved = false;
        poolBalance = 0;
    }

    function setWalkerAddress(address _walkerAddress) public onlyAdmin {
        walkerAddress = _walkerAddress;
    }

    function getContractState() public view returns (address, uint, bool) {
        return (walker, poolBalance, goalAchieved);
    }
}
