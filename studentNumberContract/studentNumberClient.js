const {Web3} = require('web3');
const fs = require('fs');

require('dotenv').config(); // Load environment variables from .env file

const contractAddress = process.env.CONTRACT_ADDRESS;
const privateKey = process.env.CLIENT_PRIVATE_KEY;
const localNodeUrl = process.env.NETWORK_URL;

console.log(privateKey)
const web3 = new Web3(localNodeUrl);

// Replace 'gas' and 'gasPrice' with appropriate values
const gas = 200000;
const gasPrice = web3.utils.toWei('10', 'gwei');

// Replace 'studentNumber' with the value you want to set
const studentNumber = 123;

// Create a contract object using the contract ABI and address
const contractJson = JSON.parse(fs.readFileSync('build/contracts/StudentContract.json', 'utf8'));
const contractAbi = contractJson.abi;

const contract = new web3.eth.Contract(contractAbi, contractAddress);

// Specify the amount of ether to send with the transaction
const amountToSend = web3.utils.toWei('0.0054', 'ether');

// Create a transaction to write the student number to the contract
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
