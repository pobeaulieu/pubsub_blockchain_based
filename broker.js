const { Web3 } = require('web3');
const fs = require('fs');
require('dotenv').config();

const websocketUrl = process.env.WEBSOCKET_URL;
const web3 = new Web3(websocketUrl);
const contractJson = JSON.parse(fs.readFileSync('build/contracts/PubSubContract.json', 'utf8'));
const contractAbi = contractJson.abi;
const contractAddress = contractJson.networks[process.env.NETWORK_ID].address;
const contract = new web3.eth.Contract(contractAbi, contractAddress);

const messageReceivedEvent = contract.events.MessageReceived();

messageReceivedEvent.on('data', (event) => {
  console.log(`Sending message ${event.returnValues[1]} to address ${event.returnValues[2]}`);
});

messageReceivedEvent.on('error', (error) => {
  console.error('Error in event:', error);
});

console.log("Broker Started")
