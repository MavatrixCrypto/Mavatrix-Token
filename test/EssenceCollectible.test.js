const utilityFunctions = require('../utils/shuffleGenerator')
const truffleAssert = require("truffle-assertions");

const NFTCrowdsale = artifacts.require("NFTCrowdsale");
const EssenceCollectible = artifacts.require("EssenceCollectible")

const CAP = 100
const NAME = 'MAVATRIX'
const SYMBOL = 'MVX'
const EMPTY_STRING = ''
const MAX_PER_TX = 10
const ZERO = 0
const RESERVED = 19
const ADDRESS_0X0 = '0x0000000000000000000000000000000000000000'
const PRICE = 1000000000000000 // set price in Wei 10^18 => currnt price 0.01 BNB

describe("📝 ERC721 - EssenceCollectible contract", () => {
  let accounts, contract, collection_owner
  let first_user, second_user, third_user // client addresses
  let malicious_address
  let BN = web3.utils.BN // big number utils

  before(async () => {
    accounts = await web3.eth.getAccounts() // store accounts for current tests
    collection_owner = accounts[0]
    first_user = accounts[2]
    second_user = accounts[3]
    third_user = accounts[4]
    malicious_address = accounts[5]
    trusted_address = accounts[6]
  });

  describe("📍 Deployment checks", () => {
    before(async () => {
      contract = await EssenceCollectible.new(NAME, SYMBOL, CAP, { from: collection_owner })
    });
    it(`Total supply should be ${ZERO}`, async () => {
      let currentSupply = await contract.totalSupply.call()
      assert.equal(currentSupply, ZERO)
    });
    it("Name should be set on deployment", async () => {
      let currentName = await contract.name.call()
      assert.equal(currentName, NAME)
    });
    it("Symbol should be set on deployment", async () => {
      let currentSymbol = await contract.symbol.call()
      assert.equal(currentSymbol, SYMBOL)
    });
    it(`Decimals and Max per Tx should be constants`, async () => {
      let currentDecimals = await contract.decimals.call()
      let currentMax = await contract.MAX_PER_TX.call()
      currentDecimals = BN(currentDecimals).toString()
      currentMax = BN(currentMax).toString()
      assert.equal(currentDecimals, ZERO)
      assert.equal(currentMax, MAX_PER_TX)
    })
    it("Minter should be address 0x0 on deployment", async () => {
      let currentMinter = await contract.minter.call()
      assert.equal(currentMinter, ADDRESS_0X0)
    });
    it("Base_URI should be empty on deployment", async () => {
      let currentBaseURI = await contract.baseTokenURI.call()
      assert.equal(currentBaseURI, EMPTY_STRING)
    });
    it(`Current token ID should be ${ZERO}`, async () => {
      let currentTokenId = await contract.getCurrentTokenId.call()
      currentTokenId = BN(currentTokenId).toString()
      assert.equal(currentTokenId, ZERO)
    })
    it("Should reject sending ether directly to the contract", async () => {
      instance = await EssenceCollectible.deployed();
      await truffleAssert.reverts(
        instance.sendTransaction(
          { from: collection_owner, value: 1 }
        )
      );
    });
  })

  describe("📍 Supported interfaces", () => {
    // https://eips.ethereum.org/EIPS/eip-721
    const ERC721MetadataInterface = '0x5b5e139f'
    const ERC721EnumerableInterface = '0x780e9d63'
    const ERC721Interface = '0x80ac58cd'
    const ERC721TokenReceiverInterface = '0x150b7a02'

    before(async () => {
      contract = await EssenceCollectible.new(NAME, SYMBOL, CAP, { from: collection_owner })
    });
    it("Should support ERC721 extension", async () => {
      let currentInterface = await contract.supportsInterface(ERC721Interface)
      assert.equal(currentInterface, true)
    });
    it("Should support ERC721Enumerable interface", async () => {
      let currentInterface = await contract.supportsInterface(ERC721EnumerableInterface)
      assert.equal(currentInterface, true)
    });
    it("Should support ERC721Metadata interface", async () => {
      let currentInterface = await contract.supportsInterface(ERC721MetadataInterface)
      assert.equal(currentInterface, true)
    });
    it("Should not support ERC721TokenReceiver interface", async () => {
      let currentInterface = await contract.supportsInterface(ERC721TokenReceiverInterface)
      assert.equal(currentInterface, false)
    });
  })

  describe("📍 Essences Release(s)", () => {
    let singleEssence, randomBatchEssences
    let currentBatchLength = Math.floor(Math.random() * (MAX_PER_TX - 1) + 1)
    let nftContract, crowdContract

    const createBatchTx = (from_addr, beneficiary, essenceArray) => {
      return nftContract.essenceRelease(beneficiary, essenceArray, {
        from: from_addr,
      })
    }

    before(async () => {
      nftContract = await EssenceCollectible.new(NAME, SYMBOL, CAP, { from: collection_owner })
      crowdContract = await NFTCrowdsale.new(PRICE, accounts[5], nftContract.address, { from: collection_owner })
      await nftContract.updateMinter(crowdContract.address, { from: collection_owner });
      singleEssence = utilityFunctions.createBatchEssences(1)
      randomBatchEssences = utilityFunctions.createBatchEssences(currentBatchLength)
    });
    it('Should correctly set minter address', async () => {
      await nftContract.updateMinter(crowdContract.address, { from: collection_owner });
      let currentMinter = await nftContract.minter.call()
      assert.equal(currentMinter, crowdContract.address)
    })
    it("Shouldn't be allowed to mint essences if not minter", async () => {
      await truffleAssert.reverts(
        createBatchTx(malicious_address, malicious_address, singleEssence),
        "Sender is not valid minter address"
      );
    });
    it("Owner should be allowed to directly mint essences", async () => {
      await createBatchTx(collection_owner, collection_owner, randomBatchEssences)
      let currentBalanceOf = await nftContract.balanceOf.call(collection_owner)
      currentBalanceOf = BN(currentBalanceOf).toString()
      assert.equal(currentBalanceOf, currentBatchLength)
    });
    it("Should not be possible to mint more than max amount per tx", async () => {
      let tooBigBatch = utilityFunctions.createBatchEssences(MAX_PER_TX + 1)
      await truffleAssert.reverts(
        createBatchTx(collection_owner, first_user, tooBigBatch),
        "ERC721MultiBatch: multiple batch max amount exceeded"
      );
    });
    it("Should check against correct supply", async () => {
      let currentSupply = await nftContract.totalSupply.call()
      currentSupply = BN(currentSupply).toString()
      assert.equal(currentSupply, currentBatchLength)
    });
    it("Should release the correct amount to the correct owner", async () => {
      await createBatchTx(collection_owner, first_user, randomBatchEssences)
      let currentBalanceOf = await nftContract.balanceOf.call(first_user)
      currentBalanceOf = BN(currentBalanceOf).toString()
      assert.equal(currentBalanceOf, currentBatchLength)
    });
  })

  describe("📍 POST Release checks", () => {
    let singleEssence, randomBatchEssences
    let currentBatchLength = Math.floor(Math.random() * (MAX_PER_TX - 1) + 1)
    let nftContract, crowdContract, freshRandomDna

    const createBatchTx = (from_addr, beneficiary, essenceArray) => {
      return nftContract.essenceRelease(beneficiary, essenceArray, {
        from: from_addr,
      })
    }

    const getRandomInBatch = () => {
      return Math.floor(Math.random() * currentBatchLength)
    }

    before(async () => {
      freshRandomDna = utilityFunctions.createBatchEssences(RESERVED)
      nftContract = await EssenceCollectible.new(NAME, SYMBOL, CAP, { from: collection_owner })
      crowdContract = await NFTCrowdsale.new(PRICE, accounts[5], nftContract.address, { from: collection_owner })
      await nftContract.updateMinter(crowdContract.address, { from: collection_owner });
      singleEssence = utilityFunctions.createBatchEssences(1)
      randomBatchEssences = utilityFunctions.createBatchEssences(currentBatchLength)
    });
    it("Should increase currentTokenId", async () => {
      await createBatchTx(collection_owner, first_user, randomBatchEssences)
      let currentTokenId = await nftContract.getCurrentTokenId.call()
      currentTokenId = BN(currentTokenId).toString()
      assert.equal(currentTokenId, currentBatchLength)
    });
    it("Client balance should increase", async () => {
      await createBatchTx(collection_owner, second_user, randomBatchEssences)
      let currentBalanceOf = await nftContract.balanceOf.call(second_user)
      currentBalanceOf = BN(currentBalanceOf).toString()
      assert.equal(currentBalanceOf, currentBatchLength)
    });
    it("Total supply should increase", async () => {
      let currentSupply = await nftContract.totalSupply.call()
      currentSupply = BN(currentSupply).toString()
      assert.equal(currentSupply, currentBatchLength * 2)
    });
    it("Should correctly map essencesById", async () => {
      let currentEssence = utilityFunctions.createBatchEssences(1)
      let currentTokenId = await nftContract.getCurrentTokenId.call()
      await createBatchTx(collection_owner, third_user, currentEssence)
      let essenceByID = await nftContract.essencesById(currentTokenId)
      essenceByID = BN(essenceByID).toString()
      assert.equal(essenceByID, currentEssence[0])
    });
    it("Should correctly map tokenOfOwnerByIndex", async () => {
      let randomID = getRandomInBatch()
      let essenceCheck = randomBatchEssences[randomID]
      let essenceByID = await nftContract.essencesById(randomID)
      essenceByID = BN(essenceByID).toString()
      assert.equal(essenceByID, essenceCheck)
    });
    it("Should not be possible to mint more than total supply", async () => {
      tempContract = await EssenceCollectible.new(NAME, SYMBOL, 1, { from: collection_owner })
      await tempContract.essenceRelease(third_user, singleEssence, {
        from: collection_owner,
      })
      await truffleAssert.reverts(
        tempContract.essenceRelease(third_user, singleEssence, {
          from: collection_owner,
        }), "ERC721Capped: exceeds maximum supply"
      );
    })
  })
})

describe("📝 NFT Crowdsale contract", () => {
  let accounts, nftContract, crowdContract, collection_owner
  let wallet_address
  let BN = web3.utils.BN // big number utils

  before(async () => {
    accounts = await web3.eth.getAccounts() // store accounts for current tests
    collection_owner = accounts[0]
    first_user = accounts[2]
    second_user = accounts[3]
    third_user = accounts[4]
    wallet_address = accounts[7]
  });

  describe("📍 Deployment checks", () => {
    before(async () => {
      nftContract = await EssenceCollectible.new(NAME, SYMBOL, CAP, { from: collection_owner })
      crowdContract = await NFTCrowdsale.new(PRICE, wallet_address, nftContract.address, { from: collection_owner })
      await nftContract.updateMinter(crowdContract.address, { from: collection_owner });
    });

    it(`Wei raised supply should be ${ZERO}`, async () => {
      let currentWei = await crowdContract.weiRaised.call()
      currentWei = BN(currentWei).toString()
      assert.equal(currentWei, ZERO)
    });
    it(`Wallet address should be ${wallet_address}`, async () => {
      let currentWallet = await crowdContract.wallet.call()
      assert.equal(currentWallet, wallet_address)
    });
    it(`Price should be set and equals ${PRICE}`, async () => {
      let currentPrice = await crowdContract.price.call()
      currentPrice = BN(currentPrice).toString()
      assert.equal(currentPrice, PRICE)
    });
    it(`NFT token address should be set on deploy`, async () => {
      let currentNft = await crowdContract.nft.call()
      assert.equal(currentNft, nftContract.address)
    });
    it("Should reject sending ether directly to the contract", async () => {
      instance = await EssenceCollectible.deployed();
      await truffleAssert.reverts(
        instance.sendTransaction(
          { from: collection_owner, value: 1 }
        )
      );
    });
  })
})

describe("📝 Crowdsale/NFT interaction flow", () => {
  let accounts, collection_owner
  let first_user, second_user // client addresses
  let malicious_address, wallet_address
  let BN = web3.utils.BN // big number utils

  before(async () => {
    accounts = await web3.eth.getAccounts() // store accounts for current tests
    collection_owner = accounts[0]
    first_user = accounts[2]
    second_user = accounts[3]
    third_user = accounts[4]
    malicious_address = accounts[5]
    wallet_address = accounts[6]
  });

  describe("📍 Essences Release flow", () => {
    let singleEssence, randomBatchEssences
    let currentBatchLength = Math.floor(Math.random() * (MAX_PER_TX - 1) + 1)
    let nftContract, crowdContract

    const createBatchTx = (from_addr, beneficiary, essenceArray) => {
      return nftContract.essenceRelease(beneficiary, essenceArray, {
        from: from_addr,
      })
    }

    const mintTokens = (from_addr, tx_value, payload) => {
      return crowdContract.buyTokens(payload, {
        from: from_addr,
        value: tx_value
      })
    }

    before(async () => {
      nftContract = await EssenceCollectible.new(NAME, SYMBOL, CAP, { from: collection_owner })
      crowdContract = await NFTCrowdsale.new(PRICE, wallet_address, nftContract.address, { from: collection_owner })
      singleEssence = utilityFunctions.createBatchEssences(1)
      randomBatchEssences = utilityFunctions.createBatchEssences(currentBatchLength)
    });

    it('Should correctly set minter address', async () => {
      await nftContract.updateMinter(malicious_address, { from: collection_owner });
      let currentMinter = await nftContract.minter.call()
      assert.equal(currentMinter, malicious_address)
    })

    it("Should emit the MinterAdded event", async () => {
      let result = await nftContract.updateMinter(crowdContract.address, { from: collection_owner });
      truffleAssert.eventEmitted(result, 'MinterAdded', (ev) => {
        return ev.account == crowdContract.address;
      }, 'Contract should return the correct event');
    });

    it("Shouldn't be allowed to mint essences if not minter anymore", async () => {
      await truffleAssert.reverts(
        createBatchTx(malicious_address, malicious_address, singleEssence),
        "Sender is not valid minter address"
      );
    });
    it("Should not be possible to mint more than max amount per tx", async () => {
      let tooBigBatch = utilityFunctions.createBatchEssences(MAX_PER_TX + 1)
      await truffleAssert.reverts(
        createBatchTx(collection_owner, first_user, tooBigBatch),
        "ERC721MultiBatch: multiple batch max amount exceeded"
      );
    })
    it("Should revert if msg.value equals 0", async () => {
      await truffleAssert.reverts(
        mintTokens(first_user, 0, singleEssence),
        "Crowdsale: msg.value is invalid"
      );
    });
    it("Should revert if price mismatches essences length", async () => {
      currentPrice = await crowdContract.price.call()
      let wrongPrice = BN(currentPrice).add(new BN('1')).toString();

      await truffleAssert.reverts(
        mintTokens(first_user, wrongPrice, singleEssence),
        "Crowdsale: incorrect value supplied as amount"
      );
    });
    it('Should issue the correct amount of tokens (single release)', async () => {
      await mintTokens(first_user, PRICE, singleEssence)
      let currentBalanceOf = await nftContract.balanceOf.call(first_user)
      currentBalanceOf = BN(currentBalanceOf).toString()
      assert.equal(currentBalanceOf, singleEssence.length)
    })
    it('Should issue the correct amount of tokens (multiple release)', async () => {
      await mintTokens(second_user, PRICE * randomBatchEssences.length, randomBatchEssences)
      let currentBalanceOf = await nftContract.balanceOf.call(second_user)
      currentBalanceOf = BN(currentBalanceOf).toString()
      assert.equal(currentBalanceOf, randomBatchEssences.length)
    })
    it('Should forward funds to the correct wallet (single release)', async () => {
      let preWalletBalance = await web3.eth.getBalance(wallet_address);
      await mintTokens(first_user, PRICE, singleEssence)
      let postWalletBalance = await web3.eth.getBalance(wallet_address);
      let wantedBalance = new BN(preWalletBalance).add(new BN(PRICE)).toString()

      assert.equal(postWalletBalance, wantedBalance)
    })
    it('Should forward funds to the correct wallet (multiple release)', async () => {
      let preWalletBalance = await web3.eth.getBalance(wallet_address);
      await mintTokens(second_user, PRICE * randomBatchEssences.length, randomBatchEssences)
      let postWalletBalance = await web3.eth.getBalance(wallet_address);
      let wantedBalance = new BN(preWalletBalance).add(new BN(PRICE * randomBatchEssences.length)).toString()

      assert.equal(postWalletBalance, wantedBalance)
    })
    it('Should correctly track weiRaised state', async () => {
      let preWeiRaised = await crowdContract.weiRaised.call()
      await mintTokens(second_user, PRICE * randomBatchEssences.length, randomBatchEssences)
      let postWeiRaised = await crowdContract.weiRaised.call()
      let wantedWeiRaised = new BN(preWeiRaised).add(new BN(PRICE * randomBatchEssences.length)).toString()

      assert.equal(postWeiRaised, wantedWeiRaised)
    })
  })
})

describe("📝 Ownership - EssenceCollectible contract", () => {
  let accounts, contract, collection_owner, malicious_address, trusted_address

  before(async () => {
    accounts = await web3.eth.getAccounts() // store accounts for current tests
    collection_owner = accounts[2]
    malicious_address = accounts[4]
    trusted_address = accounts[5]
  });

  describe("📍 Ownership management function", () => {
    before(async () => {
      contract = await EssenceCollectible.new(NAME, SYMBOL, CAP, { from: collection_owner })
    })
    it("Owner should be set on deployment", async () => {
      let currentOwner = await contract.owner.call()
      assert.equal(currentOwner, collection_owner)
    })
    it("If not owner shouldn't be able to transfer ownership", async () => {
      await truffleAssert.reverts(
        contract.transferOwnership(malicious_address, { from: malicious_address }),
        "Ownable: caller is not the owner"
      )
    })
    it("Owner should be able to transfer ownership", async () => {
      await contract.transferOwnership(trusted_address, { from: collection_owner })
      let newOwner = await contract.owner.call()
      assert.equal(newOwner, trusted_address)
    })
    it("If not owner shouldn't be able to set minter address", async () => {
      await truffleAssert.reverts(
        contract.updateMinter(malicious_address, { from: malicious_address }),
        "Ownable: caller is not the owner"
      )
    })
  })
})
