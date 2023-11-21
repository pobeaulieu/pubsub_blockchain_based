const { Web3 } = require('web3');
const fs = require('fs');
require('dotenv').config(); // Load environment variables from .env file

const privateKey = process.argv.slice(2)[0];

if (!privateKey) {
  console.error('Error: Private key not provided.');
  process.exit(1);
}

const websocketUrl = process.env.WEBSOCKET_URL;
const web3 = new Web3(websocketUrl);

const contractJson = JSON.parse(fs.readFileSync('build/contracts/StudentContract.json', 'utf8'));
const contractAbi = contractJson.abi;
const contractAddress = contractJson.networks[process.env.NETWORK_ID].address;
const contract = new web3.eth.Contract(contractAbi, contractAddress);

console.log(contractAddress);

// Add this section to listen to the StudentNumberUpdated event
const studentNumberUpdatedEvent = contract.events.StudentNumberUpdated();

studentNumberUpdatedEvent.on('data', (event) => {
  console.log('StudentNumberUpdated event received:', event.returnValues);
});

studentNumberUpdatedEvent.on('error', (error) => {
  console.error('Error in event:', error);
});

// Rest of your existing code...

const gas = 200000;
const gasPrice = web3.utils.toWei('10', 'gwei');
const amountToSend = web3.utils.toWei('0.0054', 'ether');

// Create a transaction to write the student number to the contract
const studentNumber = 4838;
const setStudentNumberTransaction = contract.methods.setStudentNumber(studentNumber);
const setStudentNumberEncodedTransaction = setStudentNumberTransaction.encodeABI();

const transactionObject = {
  from: web3.eth.accounts.privateKeyToAccount(Buffer.from(privateKey, 'hex')).address,
  to: contractAddress,
  gas: gas,
  gasPrice: gasPrice,
  data: setStudentNumberEncodedTransaction,
  value: amountToSend,
};

// Sign the transaction with the private key
web3.eth.accounts.signTransaction(transactionObject, Buffer.from(privateKey, 'hex'))
  .then((signedTransaction) => {
    // Send the signed transaction to the Ethereum network
    return web3.eth.sendSignedTransaction(signedTransaction.rawTransaction);
  })
  .catch((error) => {
    console.error('Error:', error);
  });
