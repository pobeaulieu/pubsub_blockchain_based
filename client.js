const { executeTransaction, contract } = require('./helpers');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function displayTopics() {
  const allTopics = await contract.methods.printAllTopics().call();
  console.log("--------------------------PUBSUB STATE--------------------------------");
  console.log(`${allTopics}`);
}

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

async function handleUserChoice(choice) {
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
}

async function runClient() {
  await displayTopics();

  console.log("------------------------------MENU------------------------------------");
  rl.question(' 1: advertise \n 2: unadvertise \n 3: publish \n 4: subscribe \n 5: unsubscribe \n 6: Listen to network \n Enter choice: ', async (choice) => {
    try {
      await handleUserChoice(choice);
    } catch (error) {
      console.error('Error:', error);
      // Restart the process by calling the function recursively
      runClient();
    }
  });
}

runClient();
