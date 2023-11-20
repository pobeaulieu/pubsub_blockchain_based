// helper.js

const { Web3 } = require('web3');
const fs = require('fs');

require('dotenv').config();

const privateKey = process.argv.slice(2)[0]

if (!privateKey) {
    console.error('Error: Private key not provided.');
    process.exit(1);
}

const localNodeUrl = process.env.NETWORK_URL;
const web3 = new Web3(localNodeUrl);

const contractJson = JSON.parse(fs.readFileSync('build/contracts/PubSubContract.json', 'utf8'));
const contractAbi = contractJson.abi;
const contractAddress = contractJson.networks[process.env.NETWORK_ID].address;
const contract = new web3.eth.Contract(contractAbi, contractAddress);

const gas = 200000;
const gasPrice = web3.utils.toWei('10', 'gwei');

async function executeTransaction(transaction, value = '0') {
  const transactionData = transaction.encodeABI();

  // Get the sender's address
  const senderAddress = web3.eth.accounts.privateKeyToAccount(Buffer.from(privateKey, 'hex')).address;

  // Create transaction object
  const transactionObject = {
    from: senderAddress,
    to: contract.options.address,
    gas: gas,
    gasPrice: gasPrice,
    data: transactionData,
    value: web3.utils.toWei(value, 'ether'),
  };

  // Sign and send the transaction
  try {
    const signedTransaction = await web3.eth.accounts.signTransaction(transactionObject, privateKey);
    const receipt = await web3.eth.sendSignedTransaction(signedTransaction.rawTransaction);

    console.log('Transaction receipt:', receipt);

    return receipt;
  } catch (error) {
    console.error('Error executing transaction:', error.message);
    throw error;
  }
}


module.exports = {
  executeTransaction,
  contract
};
