const HDWalletProvider = require('@truffle/hdwallet-provider');

require('dotenv').config(); // Load environment variables from .env file

module.exports = {
  networks: {
    ganache: {
      provider: () => new HDWalletProvider([process.env.DEPLOYMENT_SENDER_PRIVATE_KEY], process.env.NETWORK_URL),
      host: process.env.HOST, 
      port: process.env.PORT, 
      network_id: process.env.NETWORK_ID,   
    }
  },

  compilers: {
    solc: {
      version: "0.7.1",   
    }
  },
};
