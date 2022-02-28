// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract NFTforUkraine is ERC721, Ownable {
    using Counters for Counters.Counter;

    uint256 public constant MAX_SUPPLY = 10;
    uint256 public constant MINT_PRICE = 5 gwei;

    function _baseURI() internal pure override returns (string memory) {
        return "ipfs://QmcSefU1XkQb4qyGaP3zJyYVVSgocn1JFXGWGUNt6rP32u/";
    }

    constructor() ERC721("NFT for Ukraine", "NFTUKRAINE") {}

    function mint(uint256 tokenId) external payable {
        require(
            tokenId <= MAX_SUPPLY,
            "Cannot mint token with id greater than MAX_SUPPLY"
        );
        require(tokenId > 0, "Cannot mint token 0");
        require(!_exists(tokenId), "Token already minted");
        require(msg.value >= MINT_PRICE, "Not enough funds to mint token");

        _safeMint(msg.sender, tokenId);
    }
}
