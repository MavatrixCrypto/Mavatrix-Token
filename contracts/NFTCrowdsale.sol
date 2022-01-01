//SPDX-License-Identifier: MIT
pragma solidity 0.8.2;

import "./EssenceCollectible.sol";

/**
 * @title NFTCrowdsale
 * @dev Using this contract people will be able to send BNB to this contract by receiving
 * NFT tokens back.
 */
contract NFTCrowdsale {
    // The token being sold
    EssenceCollectible public nft;

    // Address where funds are collected
    address public wallet;

    uint256 public price;
    uint256 public weiRaised;

    event NftPurchase(address indexed beneficiary, uint256 amount);

    constructor(
        uint256 _price,
        address _wallet,
        EssenceCollectible _nft
    ) {
        require(_price > 0, "Crowdsale: Cannot set price equal 0");
        require(
            _wallet != address(0),
            "Crowdsale: Cannot set recipient wallet address 0x0"
        );
        require(
            address(_nft) != address(0),
            "Crowdsale: Cannot set NFT contract address 0x0"
        );

        price = _price;
        wallet = _wallet;
        nft = _nft;
    }

    /*
     * reverts ether sent with no txData
     */
    receive() external payable {
        revert();
    }

    /*
     * reverts ether sent with txData that does not match any function signature in the contract
     */
    fallback() external {
        revert();
    }

    /**
     * @dev Token purchase
     * @param payload[] Array of data involved in the purchase
     */
    function buyTokens(uint256[] memory payload) public payable {
        require(msg.value > 0, "Crowdsale: msg.value is invalid");
        
        _preValidatePurchase(msg.sender, payload);
        // update state
        weiRaised = weiRaised + msg.value;

        _processPurchase(payload);
        emit NftPurchase(msg.sender, payload.length);

        _forwardFunds();
    }

    /**
     * @dev Validation of an incoming purchase. 
     * @param _beneficiary Address performing the token purchase
     * @param payload[] Array of data involved in the purchase
     */
    function _preValidatePurchase(
        address _beneficiary,
        uint256[] memory payload
    ) internal view {
        require(
            msg.value == price * payload.length,
            "Crowdsale: incorrect value supplied as amount"
        ); // TODO: test overflow
        require(
            _beneficiary != address(0),
            "Crowdsale: can't mint to address 0x0"
        );
    }

    /**
     * @dev Mints new tokens.
     * @param payload[] NFT essence(s) attribute(s)
     */
    function _processPurchase(uint256[] memory payload) internal {
        nft.essenceRelease(msg.sender, payload);
    }

    /**
     * @dev Forward BNB on purchase.
     */
    function _forwardFunds() internal {
        payable(wallet).transfer(msg.value);
    }
}
