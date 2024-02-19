const express = require('express');
const axios = require('axios');
const qs = require('querystring');
const Web3 = require('web3');

const web3 = new Web3("https://<network>.infura.io/v3/YOUR_INFURA_PROJECT_ID"); // Your Infura Key
const contractABI = [...]; // Your contract ABI
const contractAddress = 'YOUR_CONTRACT_ADDRESS'; // Your smart contract address

const contract = new web3.eth.Contract(contractABI, contractAddress);
require('dotenv').config();
const privateKey = process.env.PRIVATE_KEY; 
const account = web3.eth.accounts.privateKeyToAccount(privateKey);

const app = express();
let accessToken = '';
let refreshToken = '';

app.get('/', (req, res) => {
    const code = req.query.code;
    
    if (code) {
        const client_id = 'YOUR_CLIENT_ID';
        const client_secret = 'YOUR_CLIENT_SECRET';
        const redirect_uri = 'YOUR_REDIRECT_URI';
        const grant_type = 'authorization_code';

        axios.post('https://oauth2.googleapis.com/token', qs.stringify({
            code: code,
            client_id: client_id,
            client_secret: client_secret,
            redirect_uri: redirect_uri,
            grant_type: grant_type,
        })).then(response => {
            accessToken = response.data.access_token;
            refreshToken = response.data.refresh_token;
            res.send("Authentication successful. Access token obtained. You can now close this window.");
        }).catch(error => {
            console.error('Error exchanging the code:', error);
            res.send("Error during code exchange.");
        });
    } else {
        res.send("Welcome to the OAuth test server!");
    }
});

app.get('/fetchSteps', (req, res) => {
    console.log('Starting /fetchSteps request');

    if (!accessToken) {
        console.log('Access token not available');
        return res.status(401).send('Unauthorized access. Please authenticate.');
    }

    const today = new Date();
    const startTime = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0).toISOString();
    const endTime = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59).toISOString();

    console.log(`Requested period: From: ${startTime} To: ${endTime}`);

    axios.post('https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate', {
        "aggregateBy": [{
            "dataSourceId": "derived:com.google.step_count.delta:com.google.android.gms:estimated_steps"
        }],
        "bucketByTime": { "durationMillis": 86400000 },
        "startTimeMillis": new Date(startTime).getTime(),
        "endTimeMillis": new Date(endTime).getTime()
    }, {
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    }).then(async response => {
        console.log('Response received from Google Fit API');
        const steps = response.data.bucket[0]?.dataset[0]?.point[0]?.value[0]?.intVal || 0;
        console.log(`Number of steps today: ${steps}`);

        if (steps > 1000) {
            try {
                await markGoalAsAchieved();
                console.log("Calling smart contract...");
                res.send(`Goal achieved: ${steps} steps. The smart contract has been notified.`);
            } catch (error) {
                console.error('Error interacting with the smart contract:', error.message);
                res.status(500).send("Error interacting with the smart contract.");
            }
        } else {
            res.send(`Number of steps today: ${steps}. Goal not achieved.`);
        }
    }).catch(error => {
        console.error('Error querying the Google Fit API:', error.response ? error.response.data : error.message);
        res.status(500).send("Error retrieving step data.");
    });
});

async function markGoalAsAchieved() {
    const data = contract.methods.markGoalAchieved(true).encodeABI();
    const nonce = await web3.eth.getTransactionCount(account.address);
    const gasLimit = 100000;
    const maxPriorityFeePerGas = web3.utils.toWei('2', 'gwei');
    const maxFeePerGas = web3.utils.toWei('100', 'gwei');
}