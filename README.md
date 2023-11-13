
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
- update the `.env` file to provide the private key of the deployment sender account. This key can be obtained via the Ganache UI. 
- <img src="readmeImages/ganachekey.png" alt="i1" style="width:800px;"/>
- Run deployment (migration)
```
truffle migrate --network ganache --reset
```
### 4. Tests
```
truffle test --network ganache --reset
```

## Web3 Clients
- In `.env` file, provide `CLIENT_PRIVATE_KEY` (Can be found in Ganache UI the same way as documented in Deployment step). 
- Run Web3 client 
```
node studentNumberClient.js
``` 

## System Architecture
- <img src="readmeImages/architecture.png" alt="i1" style="width:800px;"/>
