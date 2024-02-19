const Web3 = require('web3');
const web3 = new Web3(Web3.givenProvider || "https://<network>.infura.io/v3/YOUR_PROJECT_ID"); //Your Infura key

document.getElementById("connectWallet").addEventListener('click', () => {
    ethereum.request({ method: 'eth_requestAccounts' })
    .then(accounts => console.log(`Connected account: ${accounts[0]}`))
    .catch(err => console.error("There was an error!", err));
});

async function initialize() {
}

let bettingGame;
let userAccount;

// Wallet connection
document.getElementById("connectWallet").addEventListener('click', () => {
    ethereum.request({ method: 'eth_requestAccounts' });
});

// Initialize the contract
async function initContract() {
    const contractABI = [...]; // Your contract ABI
    const contractAddress = 'YOUR_CONTRACT_ADDRESS'; // Your smart contract address
    try {
        bettingGame = new web3.eth.Contract(contractABI, contractAddress);
        console.log("Contract initialized successfully");
    } catch (error) {
        console.error("Error initializing contract:", error);
    }
}

// Initialize contract on Ethereum provider connection
if (window.ethereum) {
    ethereum.on('connect', () => {
        initContract();
    });
}


// Joining a bet
document.getElementById("joinBet").addEventListener('click', () => {
    joinBet();
});

async function joinBet() {
    if (!bettingGame) {
        alert("Contract not loaded, or MetaMask not connected");
        return;
    }
    await bettingGame.methods.joinBet().send({ from: userAccount, value: web3.utils.toWei("0.1", "ether") })
        .on('receipt', receipt => {
            console.log("Bet joined!", receipt);
        })
        .on('error', error => {
            console.error("Error joining bet", error);
        });
}

