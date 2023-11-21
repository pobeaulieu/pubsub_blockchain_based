const { Web3 } = require('web3');
const fs = require('fs');
require('dotenv').config();

// ############################ Setup Server ############################
const express = require('express');
const http = require('http');
const WebSocket = require('ws');

const port = process.argv.slice(2)[0]

if (!port) {
  console.error('Error: Port to start Broker not provided.');
  process.exit(1);
}

const app = express();

//initialize a simple http server
const server = http.createServer(app);

//initialize the WebSocket server instance
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
  const clientIpAddress = ws._socket.remoteAddress;
  const info = ws._socket._peername.port;

  // connection is up, let's add a simple event
  ws.on('message', (message) => {
      // log the received message and send it back to the client
      console.log(`Received from IP: ${clientIpAddress} PORT ${info} Message-> ${message}`);
  });

  // send immediately feedback to the incoming connection    
  ws.send(`Your IP address is ${clientIpAddress} PORT ${info}`);
});

//start our server
server.listen(port, () => {
    console.log(`Broker started on port ${server.address().port}`);
});


// ############################ Listen to Blockchain events ############################
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
