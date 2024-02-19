// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;

contract StepBettingGame {
    address public admin;
    address public serverAddress;
    address public walker;
    uint public poolBalance;
    uint public stepGoal = 1000;
    bool public goalAchieved = false;

    constructor() {
        admin = msg.sender;
        // Initialiser serverAddress avec l'adresse de votre serveur
        // Cette adresse doit être configurée pour que seul le serveur puisse marquer l'objectif comme atteint
        serverAddress = 0xaC8af5ff5291134D310Bc4D516D512D0Dabe71ad; // Remplacer 0xServerAddress par l'adresse réelle
    }

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can call this.");
        _;
    }

    modifier onlyServer() {
        require(msg.sender == serverAddress, "Only server can call this.");
        _;
    }

    // Permet à l'admin d'ajouter des fonds à la pool
    function addToPool() public payable onlyAdmin {
        poolBalance += msg.value;
    }

    // Définir l'adresse du marcheur
    function setWalker(address _walker) public onlyAdmin {
        walker = _walker;
    }

    // Marquer l'objectif comme atteint (appelé par le serveur)
    function markGoalAchieved(bool _goalAchieved) public onlyServer {
        goalAchieved = _goalAchieved;
    }

    // Transférer la pool au marcheur si l'objectif est atteint
    function transferIfGoalAchieved() public onlyAdmin {
        require(goalAchieved, "Step goal not achieved yet.");
        require(poolBalance > 0, "Pool balance is zero.");

        payable(walker).transfer(poolBalance);
        // Réinitialisation de l'état pour permettre un nouveau pari
        goalAchieved = false;
        poolBalance = 0;
    }

    // Modifier l'adresse du serveur (optionnel, pour la flexibilité)
    function setServerAddress(address _serverAddress) public onlyAdmin {
        serverAddress = _serverAddress;
    }

    // Fonction pour récupérer l'état actuel du contrat (pour vérification)
    function getContractState() public view returns (address, uint, bool) {
        return (walker, poolBalance, goalAchieved);
    }
}
