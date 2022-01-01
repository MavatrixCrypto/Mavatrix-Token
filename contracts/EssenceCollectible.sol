//SPDX-License-Identifier: MIT
pragma solidity 0.8.2;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract EssenceCollectible is ERC721Enumerable, Ownable {
    using Counters for Counters.Counter;

    address private crowdsale;
    string public baseTokenURI;
    uint256 public constant MAX_PER_TX = 10;
    uint256 private constant DECIMALS = 0;
    // maximum released NFTs amount
    uint256 private _max_supply; 

    Counters.Counter private tokenIds;
    mapping(uint256 => uint256) public essencesById;

    event RequestedEssenceBatch(uint256 tokenAmount, address indexed account);
    event MinterAdded(address indexed account);

    modifier onlyMinter() {
        require(msg.sender == minter() || msg.sender == owner(), "Sender is not valid minter address");
        _;
    }

    constructor(
        string memory tokenName,
        string memory tokenSymbol,
        uint256 __max_supply
    ) ERC721(tokenName, tokenSymbol) {
        _max_supply = __max_supply;
    }

    /*
     * handles ether sent with no txData
     */
    receive() external payable {
        revert();
    }

    /*
     * refuses ether sent with txData that does not match any function signature in the contract
     */
    fallback() external {
        revert();
    }

    /**
     * @dev Token minting and assignment.
     * @dev onlyMinter modifier applies to this function
     * @param tokenOwner Address performing the token purchase
     * @param essences[] Array of data involved in the purchase
     */
    function essenceRelease(address tokenOwner, uint256[] memory essences)
        external
        onlyMinter
        returns (bool)
    {
        require(essences.length <= MAX_PER_TX, "ERC721MultiBatch: multiple batch max amount exceeded");
        uint256 supply = getCurrentTokenId();
        require(supply + essences.length <= _max_supply,"ERC721Capped: exceeds maximum supply");
        for (uint256 i; i < essences.length; i++) {
            _essenceRelease(tokenOwner, essences[i]);
        }
        emit RequestedEssenceBatch(essences.length, msg.sender);
        return true;
    }

    /**
     * @dev Update base_URI for all tokens, onlyOwner rules applied.
     */
    function setBaseURI(string memory _baseTokenURI) external onlyOwner {
        baseTokenURI = _baseTokenURI;
    }

    /**
     * @dev Call token decimals
     * @return DECIMALS (uint256)
     */
    function decimals() external pure returns (uint256) {
        return DECIMALS;
    }

    /**
     * @dev Call crowdsale address
     * @return crowdsale (address)
     */
    function minter() public view returns (address) {
        return crowdsale;
    }

    /**
     * @dev Update minter address, onlyOwner rules applied.
     * @return crowdsale (address)
     */
    function updateMinter(address _crowdsale) public onlyOwner returns (bool) {
        require(_crowdsale != address(0), "Not a valid minter address inserted");
        crowdsale = _crowdsale;
        emit MinterAdded(_crowdsale);
        return true;
    }

    /**
     * @dev Call current ID
     * @return nextTokenID that will be issued (uint256)
     */
    function getCurrentTokenId() public view returns (uint256) {
        return tokenIds.current();
    }

    /**
     * @dev Call current baseURI
     * @return overridden value for baseURI
     */
    function _baseURI() internal view virtual override returns (string memory) {
        return baseTokenURI;
    }

    /**
     * @dev Single token private minting function. 
     * @dev SafeMints a new token, map his essence and increment tokenID counter
     * @param player Address performing the token purchase
     * @param essence Current data involved in the purchase
     */
    function _essenceRelease(address player, uint256 essence) private {
        uint256 newTokenId = tokenIds.current();
        tokenIds.increment();
        _safeMint(player, newTokenId);
        essencesById[newTokenId] = essence;
    }
}