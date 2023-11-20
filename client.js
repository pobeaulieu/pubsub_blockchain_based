const { executeTransaction, contract } = require('./helpers');
const readline = require('readline');
const txCost = '0.0054';

console.log('Arguments:', process.argv.slice(2)[0]);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function runClient() {
  const allTopics = await contract.methods.printAllTopics().call();
  console.log("--------------------------PUBSUB STATE--------------------------------") 
  console.log(`${allTopics}`);
  console.log("------------------------------MENU------------------------------------")
  rl.question(' 1: advertise \n 2: unadvertise \n 3: publish \n 4: subscribe \n 5: unsubscribe \n 6: Listen to network \n Enter choice: ', async (choice) => {
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
        rl.question('Enter the topic to unadvertise to: ', async (topicName) => {
          const publishTransaction = contract.methods.unadvertise(topicName);
          await executeTransaction(publishTransaction, txCost);
          runClient();
        });
      } else if (choice === '3') {
        // Publish a message
        rl.question('Enter the topic to publish to: ', async (topicName) => {
          rl.question('Enter the message to publish: ', async (publishedMessage) => {
            const publishTransaction = contract.methods.publish(topicName, publishedMessage);
            await executeTransaction(publishTransaction, txCost);
            runClient();
          });
        });
      } else {
        console.log('Invalid choice.');
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
