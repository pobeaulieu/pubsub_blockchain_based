var MyContract = artifacts.require("StudentContract");

module.exports = function(deployer) {
  // deployment steps
  deployer.deploy(MyContract).then(function(instance) {
    console.log("Contract deployed at address:", instance.address);
  }).catch(function(error) {
    console.error("Error deploying contract:", error.message);
  });
};