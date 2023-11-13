const {Web3} = require('web3');
const fs = require('fs');
require('dotenv').config(); // Load environment variables from .env file

const privateKey = process.env.CLIENT_PRIVATE_KEY;
const localNodeUrl = process.env.NETWORK_URL;
const web3 = new Web3(localNodeUrl);

const contractJson = JSON.parse(fs.readFileSync('build/contracts/StudentContract.json', 'utf8'));
const contractAbi = contractJson.abi;
const contractAddress = contractJson.networks[process.env.NETWORK_ID].address;
const contract = new web3.eth.Contract(contractAbi, contractAddress);

console.log(contractAddress)
const gas = 200000;
const gasPrice = web3.utils.toWei('10', 'gwei');
const amountToSend = web3.utils.toWei('0.0054', 'ether');

// Create a transaction to write the student number to the contract
const studentNumber = 721;
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
  .then((receipt) => {
    console.log('Transaction receipt:', receipt);

    // Now, read the student number value from the contract
    return contract.methods.getStudentNumber().call();
  })
  .then((result) => {
    console.log('Student number after transaction:', result);
  })
  .catch((error) => {
    console.error('Error:', error);
  });
