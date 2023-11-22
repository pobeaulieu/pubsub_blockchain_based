const { Web3 } = require('web3');
const fs = require('fs');
const express = require('express');
const http = require('http');
const WebSocket = require('ws');
require('dotenv').config();

const port = process.argv.slice(2)[0];

if (!port) {
    console.error('Error: Port to start Broker not provided.');
    process.exit(1);
}

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Map to store WebSocket connections based on Ethereum addresses
const ethAddressToWsMap = new Map();

wss.on('connection', (ws) => {
    ws.on('message', (ethAddressMessage) => {
        const clientIpAddress = ws._socket.remoteAddress;
        const port = ws._socket._peername.port;
        console.log(`OPEN CONNECTION. Client INFO: ip=${clientIpAddress}, port=${port}, address=${ethAddressMessage}`);

        // Store the WebSocket connection in the map using Ethereum address as the key
        ethAddressToWsMap.set(ethAddressMessage.toString(), ws);

        ws.send(`CONNECTED TO BROKER. Client INFO: {ip=${clientIpAddress}, port=${port}, address=${ethAddressMessage}}`);
    });

    ws.on('close', () => {
        const clientIpAddress = ws._socket.remoteAddress;
        const port = ws._socket._peername.port;
        console.log(`CLOSED CONNECTION. Client INFO: ip=${clientIpAddress}, port=${port}`);

        // Remove the WebSocket connection from the map when it is closed
        ethAddressToWsMap.forEach((value, key) => {
            if (value === ws) {
                ethAddressToWsMap.delete(key);
            }
        });
    });
});

server.listen(port, () => {
    console.log(`Broker started on port ${server.address().port}`);
});

const websocketUrl = process.env.WEBSOCKET_URL;
const web3 = new Web3(websocketUrl);
const contractJson = JSON.parse(fs.readFileSync('build/contracts/PubSubContract.json', 'utf8'));
const contractAbi = contractJson.abi;
const contractAddress = contractJson.networks[process.env.NETWORK_ID].address;
const contract = new web3.eth.Contract(contractAbi, contractAddress);
const messageReceivedEvent = contract.events.MessageReceived();

messageReceivedEvent.on('data', (event) => {
    const topic = event.returnValues[0];
    const message = event.returnValues[1];
    const ethAddress = event.returnValues[2];

    // Check if there is a WebSocket connection associated with the Ethereum address
    const ws = ethAddressToWsMap.get(ethAddress);

   if (ws) {
        console.log(`Sending message "${message}" to address ${ethAddress}`);
        ws.send(`Topic: ${topic}, Message: ${message}`);
    } else {
        console.log(`No WebSocket connection found for address ${ethAddress}`);
    }
});

messageReceivedEvent.on('error', (error) => {
    console.error('Error in event:', error);
});
