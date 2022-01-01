const utilityFunctions = require('../utils/shuffleGenerator')

const EssenceCollectible = artifacts.require("EssenceCollectible");
const NFTCrowdsale = artifacts.require("NFTCrowdsale");

module.exports = async (deployer, network, accounts) => {

  const MAX_SUPPLY = 50
  const PRICE = 1000000000000000 // set price in Wei 10^18 => currnt price 0.01 BNB
  
  let nft_address, nft_crowdsale_address
  let freshRandomDna = utilityFunctions.createBatchEssences(19)

  await deployer
    .deploy(EssenceCollectible, 'Tool NFT 004', "TT004", MAX_SUPPLY, { from: accounts[0] })
    .then(async (instance) => {
      nft_address = instance.address;
      let crowd = await deployer.deploy(NFTCrowdsale, PRICE, accounts[5], nft_address)
      return crowd
    })
    .then(async (instance) => {
      nft_crowdsale_address = await instance.address;
      essenceInstance = await EssenceCollectible.deployed(); // Get an instance of already deployed contract
      await essenceInstance.updateMinter(nft_crowdsale_address);
      return true
    })
    .catch((err) => {
      console.log(`There was an error deploying migrations : ${err}`)
    })
};
