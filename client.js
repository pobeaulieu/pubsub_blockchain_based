const { Web3 } = require('web3');
const fs = require('fs');

require('dotenv').config();

const privateKey = process.argv.slice(2)[0]

if (!privateKey) {
    console.error('Error: Private key not provided.');
    process.exit(1);
}

const readline = require('readline');
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

    console.log('Transaction Executed');

    return receipt;
  } catch (error) {
    console.error('Error executing transaction:', error.message);
    throw error;
  }
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function advertiseTopic() {
  rl.question('Enter the topic to advertise: ', async (topicName) => {
    const advertiseTransaction = contract.methods.advertise(topicName);
    await executeTransaction(advertiseTransaction, 0);
    runClient();
  });
}

async function unadvertiseTopic() {
  rl.question('Enter the topic to unadvertise to: ', async (topicName) => {
    const publishTransaction = contract.methods.unadvertise(topicName);
    await executeTransaction(publishTransaction, 0);
    runClient();
  });
}

async function publishMessage() {
  rl.question('Enter the topic to publish to: ', async (topicName) => {
    rl.question('Enter the message to publish: ', async (publishedMessage) => {
      const publishTransaction = contract.methods.publish(topicName, publishedMessage);
      await executeTransaction(publishTransaction, 0);
      runClient();
    });
  });
}

async function subscribeToTopic() {
  rl.question('Enter the topic to subscribe to: ', async (topicName) => {
    rl.question('Enter deposit: ', async (deposit) => {
      const subscribeTx = contract.methods.subscribe(topicName);
      await executeTransaction(subscribeTx, deposit);
      runClient();
    });
  });
}

async function unsubscribeFromTopic() {
  rl.question('Enter the topic to unsubscribe to: ', async (topicName) => {
    const unsubscribeTx = contract.methods.unsubscribe(topicName);
    await executeTransaction(unsubscribeTx, 0);
    runClient();
  });
}

async function printPubSubState(){
  const allTopics = await contract.methods.printAllTopics().call();
  console.log("--------------------------PUBSUB STATE--------------------------------");
  console.log(`${allTopics}`);

}

async function runClient() {
  // For debugging. Comment for a cleaner console.
  // await printPubSubState()

  // Clear the console before printing the menu

  console.log("------------------------------MENU------------------------------------");

  try {
    const choice = await new Promise((resolve) => {
      rl.question(' 1: advertise \n 2: unadvertise \n 3: publish \n 4: subscribe \n 5: unsubscribe \n Enter choice: \n', (answer) => {
        resolve(answer);
      });
    });

    switch (choice) {
      case '1':
        await advertiseTopic();
        break;
      case '2':
        await unadvertiseTopic();
        break;
      case '3':
        await publishMessage();
        break;
      case '4':
        await subscribeToTopic();
        break;
      case '5':
        await unsubscribeFromTopic();
        break;
      default:
        console.log('Invalid choice.');
    }
  } catch (error) {
    console.error('Error:', error);
  } 
}

const brokerPort = process.argv.slice(2)[1];

if (!brokerPort) {
  console.error('Error: Port to start Broker not provided.');
  process.exit(1);
}

const WebSocket = require('ws');

const ws = new WebSocket(`ws://localhost:${brokerPort}`);

ws.on('open', () => {
  const subscriberAddress = web3.eth.accounts.privateKeyToAccount(Buffer.from(privateKey, 'hex')).address;
  ws.send(subscriberAddress);
});

var clientRunning = false

ws.on('message', (data) => {
  console.log(`${data}`);
  const dataString = String(data); 

  if (dataString.startsWith("CONNECTED TO BROKER")) {
    runClient()
  }
});

ws.on('close', () => {
  console.log('Connection closed');
});

ws.on('error', (error) => {
  console.error(`WebSocket error: ${error.message}`);
});








