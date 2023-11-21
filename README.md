
# Publish/Subscribe on the Blockchain
## Getting Started (Prerequisites)
### 1. Create a network on Ganache and start it
```
hostname = 127.0.0.1
Port number = 7545
Network ID = 5777
```

### 2. Install node modules 
```
npm install
```
### 3. Depoyment
- update the `.env` 
- Run deployment (migration)
```
truffle migrate --network ganache --reset
```
### 4. Tests
```
truffle test --network ganache --reset
```

##  Broker 
```
node broker.js {BROKER_PORT}
```
##  Clients (Publishers and Subscribers)
```
node client.js {PRIVATE_KEY} {BROKER_PORT} 
``` 
## Example: 
### Start Broker
```
 node broker.js 65222
```
### Start 3 clients with 3 different Ethereum wallets
``` 
node client.js 83adef4a25423d0bc3ef81ccd38a855dd923f1db978511c54d62c30ab1b8a9be 65222
node client.js b0c9b55816f2ddbe4582253a6ab7fa3987569a350ed68e62f0aeaa93dfa83bc7 65222
node client.js f2466bf4cbb5c03852765c0a31bd2792e6725d5f538bd1d51edbdee47250b2d7 65222
``` 

## System Architecture
TODO