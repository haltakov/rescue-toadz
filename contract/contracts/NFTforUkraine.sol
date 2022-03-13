// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Supply.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract NFTforUkraine is ERC1155, ERC1155Supply {
    using Strings for uint256;

    uint256 public constant MAX_SUPPLY = 3;
    uint256 public constant MINT_PRICE = 5 gwei;
    address public constant PAYEE_ADDRESS =
        0x165CD37b4C644C2921454429E7F9358d18A45e14;

    mapping(uint256 => uint256) private _lastPrice;

    mapping(uint256 => address) private _owner;

    constructor()
        ERC1155("ipfs://QmbhQZVeDDPfiVYzmFb3VPH7g3WUbp2WmoTY3DHKnRtJtz/")
    {}

    function mint(uint256 tokenId) external payable {
        require(
            tokenId <= MAX_SUPPLY,
            "Cannot mint token with id greater than MAX_SUPPLY"
        );
        require(tokenId > 0, "Cannot mint token 0");
        require(!exists(tokenId), "Token already minted");
        require(msg.value >= MINT_PRICE, "Not enough funds to mint token");

        _mint(msg.sender, tokenId, 1, "");
        _owner[tokenId] = msg.sender;
        _lastPrice[tokenId] = msg.value;

        payable(PAYEE_ADDRESS).transfer(msg.value);
    }

    function capture(uint256 tokenId) external payable {
        require(exists(tokenId), "Cannot capture a token that is not minted");
        require(
            msg.value > _lastPrice[tokenId],
            "Cannot capture token without paying more than the last price"
        );

        _safeTransferFrom(_owner[tokenId], msg.sender, tokenId, 1, "");
        _owner[tokenId] = msg.sender;
        _lastPrice[tokenId] = msg.value;

        payable(PAYEE_ADDRESS).transfer(msg.value);
    }

    function lastPrice(uint256 tokenId) external view returns (uint256) {
        if (!exists(tokenId)) {
            return 0;
        }

        return _lastPrice[tokenId];
    }

    function uri(uint256 tokenId)
        public
        view
        virtual
        override
        returns (string memory)
    {
        require(exists(tokenId), "URI query for nonexistent token");

        string memory baseURI = super.uri(tokenId);
        return string(abi.encodePacked(baseURI, tokenId.toString()));
    }

    function _beforeTokenTransfer(
        address operator,
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory amounts,
        bytes memory data
    ) internal override(ERC1155, ERC1155Supply) {
        super._beforeTokenTransfer(operator, from, to, ids, amounts, data);
    }
}
