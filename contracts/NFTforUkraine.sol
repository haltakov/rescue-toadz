// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract NFTforUkraine is ERC721 {
    uint256 public constant MAX_SUPPLY = 10;
    uint256 public constant MINT_PRICE = 5 gwei;
    address public constant PAYEE_ADDRESS =
        0x9fecC154ABa86dB310cC3A81bb65f81155d6Bf98;

    mapping(uint256 => uint256) private _lastPrice;

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
        _lastPrice[tokenId] = msg.value;

        payable(PAYEE_ADDRESS).transfer(msg.value);
    }

    function buy(uint256 tokenId) external payable {
        require(_exists(tokenId), "Cannot buy a token that is not minted");
        require(
            msg.value > _lastPrice[tokenId],
            "Cannot buy token without paying more than the last price"
        );

        _safeTransfer(ownerOf(tokenId), msg.sender, tokenId, "");
        _lastPrice[tokenId] = msg.value;

        payable(PAYEE_ADDRESS).transfer(msg.value);
    }

    function lastPrice(uint256 tokenId) external view returns (uint256) {
        if (!_exists(tokenId)) {
            return 0;
        }

        return _lastPrice[tokenId];
    }
}
