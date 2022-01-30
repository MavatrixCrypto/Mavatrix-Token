# Mavatrix smart contracts

> MVTX Token contract address (BSC mainnet): 0xF0d9ef7A3aEc9f59d08961F5ea65834271A38aDF

## Solidity ERC721 and crowdsale smart contracts

The project is configured to run on Binance Smart Chain with these [truffle configs](https://docs.binance.org/smart-chain/developer/deploy/truffle.html). The set is composed by 2 different smart contracts: 

- EssenceCollectible.sol;
- NFTCrowdsale.sol;

> Notice, the `truffle-config.json` requires mnemonic to be passed in for Provider, this is the seed phrase for the account you'd like to deploy from. Create a new `.secret` file in root directory and enter your **12 word mnemonic seed phrase** to get started.

To run the project locally `node.js` and `npm` are required.

Be sure to have also `truffle` installed on your local machine. In order to clone and install required dependencies run:

```
git clone https://<path_to_this_repo>
cd name_repository
npm install
```

Go ahead by compiling and migrating the set of contracts to the network:

```
truffle compile
truffle migrate --network testnet // will compile and migrate to BSC testnet
```

If you want to run tests, you'll need to run your local blockchain instance with `ganache-cli`, install it:

```
npm install -g ganache-cli
```

Then run following commands in 2 separate terminals:

```
ganache-cli // Terminal 1. This will start the process, leave it running.
truffle test // Terminal 2. Run this command in the project folder.
```

## Contracts description:

This contract inherits and extends [Openzeppelin ERC721](https://docs.openzeppelin.com/contracts/4.x/api/token/erc721) token. We implement an updatable BaseURI in order to (eventually) migrate URI([Openzeppelin forum discussion](https://forum.openzeppelin.com/t/why-doesnt-openzeppelin-erc721-contain-settokenuri/6373/3)). The token implements also function utils for **Ownership management** and when the sale will be closed we will call the `renounceOwnership()` function in order to seal the contract and fully decentralize it.

- Core: 
    - IERC721; 
    - IERC721Metadata; 
    - IERC721Enumerable;
- Extensions: 
    - [BEP721](https://academy.binance.com/en/glossary/bep-721)
- Custom:
    - Capped;
    - Override BaseURI;
    - Mint in batch;

Minting will be role based and only one `crowdsale contract` at time is allowed to act as minter. The `NFTCrowdsale.sol` and will store logics about **allocation** of resources as well as **pricing** ones. Owner has minter role too.

- [List of BSC RPC](https://docs.binance.org/smart-chain/developer/rpc.html)

Required _dependencies_:

- `@openzeppelin/contracts:^4.3.3` -> Openzeppelin contracts standard
- `@truffle/hdwallet-provider:^1.7.0` -> To sign transactions for addresses derived from a 12 or 24 word mnemonic.
- `truffle-assertions` -> Tool for testing purposes
