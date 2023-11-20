const { executeTransaction, contract } = require('./helpers');
const readline = require('readline');
const txCost = '0.0054';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function runClient() {
  const allTopics = await contract.methods.printAllTopics().call();
  console.log("-----------------------------------------------------------------------") 
  console.log(`${allTopics}`);
  console.log("-----------------------------------------------------------------------")
  rl.question('############# MENU ############### \n 1: advertise \n 2: publish \n 3: subscribe \n 4: listen \n Enter choice: ', async (choice) => {
    try {
      if (choice === '1') {
        // Advertise a topic
        rl.question('Enter the topic to advertise: ', async (topicName) => {
          const advertiseTransaction = contract.methods.advertise(topicName);
          await executeTransaction(advertiseTransaction, txCost);
          runClient();
        });
      } else if (choice === '2') {
        // Publish a message
        rl.question('Enter the topic to publish to: ', async (topicName) => {
          rl.question('Enter the message to publish: ', async (publishedMessage) => {
            const publishTransaction = contract.methods.publish(topicName, publishedMessage);
            await executeTransaction(publishTransaction, txCost);
            runClient();
          });
        });
      } else {
        console.log('Invalid choice. Please enter 1 or 2.');
        runClient();
      }
    } catch (error) {
      console.error('Error:', error);
      // Restart the process by calling the function recursively
      runClient();
    }
  });
}

runClient();
