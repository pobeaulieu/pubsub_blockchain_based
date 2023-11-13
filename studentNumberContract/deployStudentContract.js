const Web3 = require('web3');
const TruffleContract = require('truffle-contract');
const studentNumberContract = require('./build/contracts/StudentContract.json'); // Update with your actual contract name

async function deployContract() {
  try {
    const web3 = new Web3('http://localhost:7545'); // Update with your Ethereum node URL

    const accounts = await web3.eth.getAccounts();
    const contract = TruffleContract(studentNumberContract);
    contract.setProvider(web3.currentProvider);

    const instance = await contract.new({ from: accounts[0] });

    console.log(`Contract deployed at address: ${instance.address}`);
  } catch (error) {
    console.error(`Error deploying contract: ${error.message}`);
  }
}

deployContract();