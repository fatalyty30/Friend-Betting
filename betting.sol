// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.8.2 <0.9.0;

contract BettingGame {
    address public admin;
    uint public betAmount;
    uint public betDeadline;
    mapping(address => bool) public playersJoined;
    address[] public players;
    mapping(address => uint) public scores;
    bool public scoresAssigned = false;
    uint public highestScore = 0;
    address public winner;
    uint public poolBalance;

    constructor(uint _betAmount, address[] memory _players) {
        admin = msg.sender;
        betAmount = _betAmount;
        players = _players;
        betDeadline = block.timestamp + 24 hours;
    }

    function joinBet() public payable {
        require(block.timestamp <= betDeadline, "Betting time has expired");
        require(msg.value == betAmount, "Incorrect bet amount");
        require(isPlayer(msg.sender), "Not a valid player");
        require(!playersJoined[msg.sender], "Player already joined");

        playersJoined[msg.sender] = true;
        poolBalance += msg.value;
    }

    function isPoolReady() public view returns(bool) {
        for(uint i = 0; i < players.length; i++) {
            if(!playersJoined[players[i]]) {
                return false;
            }
        }
        return true;
    }

    function assignScores(address player, uint score) public {
        require(msg.sender == admin, "Only admin can assign scores");
        require(isPoolReady(), "Pool is not ready yet");
        scores[player] = score;
        if(score > highestScore) {
            highestScore = score;
            winner = player;
        }
        scoresAssigned = true;
    }

    function withdrawPool() public {
        require(msg.sender == winner, "Only the winner can withdraw");
        require(scoresAssigned, "Scores are not assigned yet");
        payable(winner).transfer(poolBalance);
        poolBalance = 0;
    }

    function isPlayer(address addr) private view returns(bool) {
        for(uint i = 0; i < players.length; i++) {
            if(players[i] == addr) {
                return true;
            }
        }
        return false;
    }
}
