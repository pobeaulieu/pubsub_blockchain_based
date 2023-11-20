var PubSubContract = artifacts.require("PubSubContract");


module.exports = function(deployer) {
  // deployment steps
  deployer.deploy(PubSubContract).then(function(instance) {
    console.log("Contract deployed at address:", instance.address);
  }).catch(function(error) {
    console.error("Error deploying contract:", error.message);
  });
};