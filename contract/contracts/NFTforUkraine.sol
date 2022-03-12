// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract NFTforUkraine is ERC721 {
    uint256 public constant MAX_SUPPLY = 3;
    uint256 public constant MINT_PRICE = 5 gwei;
    address public constant PAYEE_ADDRESS =
        0x165CD37b4C644C2921454429E7F9358d18A45e14;

    mapping(uint256 => uint256) private _lastPrice;

    function _baseURI() internal pure override returns (string memory) {
        return "ipfs://QmbhQZVeDDPfiVYzmFb3VPH7g3WUbp2WmoTY3DHKnRtJtz/";
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

    function capture(uint256 tokenId) external payable {
        require(_exists(tokenId), "Cannot capture a token that is not minted");
        require(
            msg.value > _lastPrice[tokenId],
            "Cannot capture token without paying more than the last price"
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
