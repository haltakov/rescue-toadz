// SPDX-License-Identifier: MIT

/**
 *   @title Infinite Auction for Ukraine
 *   @author Vladimir Haltakov (@haltakov)
 *   @notice ERC1155 contract for a collection of Ukrainian themed toadz
 *   @notice All proceeds from minting and capturing tokens are donated to charity for Ukraine
 *   @notice The contract represents two types of tokens: single edition tokens (id <= SINGLE_EDITIONS_SUPPLY) and multiple edition POAP tokens (id > SINGLE_EDITIONS_SUPPLY)
 *   @notice Only the single edition tokens are allowed to be minted or captured.
 *   @notice The contract implements a special function capture, that allows anybody to transfer a single edition token to their own wallet by donating more than the last owner.
 */

pragma solidity ^0.8.12;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Supply.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract InfiniteAuctionUkraine is ERC1155, ERC1155Supply {
    using Strings for uint256;

    // Number of single edition tokens. For each single edition token there will be a corresponding multiple edition token.
    uint256 public constant SINGLE_EDITIONS_SUPPLY = 12;

    // Mint price
    uint256 public constant MINT_PRICE = 5000000 gwei;

    // Address where all funds from minting and capturing tokens are donated
    address public constant CHARITY_ADDRESS =
        0x165CD37b4C644C2921454429E7F9358d18A45e14;

    // The last price a token was minted or captured for
    mapping(uint256 => uint256) private _lastPrice;

    // The last owner of a token. This applies only for single edition tokens
    mapping(uint256 => address) private _owner;

    /**
     * @dev Default constructor
     */
    constructor()
        ERC1155("ipfs://QmS2SpPstK2JAyDKijYHeHgsFPQeAno8VG9hDDKnHNfmdZ/")
    {}

    /**
     * @dev Name of the token
     */
    function name() external pure returns (string memory) {
        return "Infinite Auction for Ukraine";
    }

    /**
     * @notice Only allowed for tokens with id <= SINGLE_EDITIONS_SUPPLY
     * @notice Only one token for every id <= SINGLE_EDITIONS_SUPPLY is allowed to be minted (smiliar to an ERC721 token)
     * @dev Mint a token
     * @param tokenId id of the token to be minted
     */
    function mint(uint256 tokenId) external payable {
        require(
            tokenId <= SINGLE_EDITIONS_SUPPLY,
            "Cannot mint token with id greater than SINGLE_EDITIONS_SUPPLY"
        );
        require(tokenId > 0, "Cannot mint token 0");
        require(!exists(tokenId), "Token already minted");
        require(msg.value >= MINT_PRICE, "Not enough funds to mint token");

        _owner[tokenId] = msg.sender;
        _lastPrice[tokenId] = msg.value;
        _mint(msg.sender, tokenId, 1, "");

        payable(CHARITY_ADDRESS).transfer(msg.value);
    }

    /**
     * @notice Only allowed for tokens with id <= SINGLE_EDITIONS_SUPPLY
     * @notice This function allows to transfer a token from another wallet by paying more than the last price paid
     * @notice This function will mint a POAP token (id > SINGLE_EDITIONS_SUPPLY) in the wallet from which the token is captured
     * @dev Capture a token from another wallet
     * @param tokenId id of the token to be captured
     */
    function capture(uint256 tokenId) external payable {
        require(
            tokenId <= SINGLE_EDITIONS_SUPPLY,
            "Cannot capture a token with id greater than SINGLE_EDITIONS_SUPPLY"
        );
        require(exists(tokenId), "Cannot capture a token that is not minted");
        require(
            msg.value > _lastPrice[tokenId],
            "Cannot capture a token without paying more than the last price"
        );

        address lastOwner = _owner[tokenId];
        _owner[tokenId] = msg.sender;
        _lastPrice[tokenId] = msg.value;

        _safeTransferFrom(lastOwner, msg.sender, tokenId, 1, "");
        _mint(lastOwner, SINGLE_EDITIONS_SUPPLY + tokenId, 1, "");

        payable(CHARITY_ADDRESS).transfer(msg.value);
    }

    /**
     * @notice Only allowed for tokens with id <= SINGLE_EDITIONS_SUPPLY
     * @dev Get the last price a token was minted or captured
     * @param tokenId id of the token to check
     */
    function lastPrice(uint256 tokenId) external view returns (uint256) {
        require(
            tokenId <= SINGLE_EDITIONS_SUPPLY,
            "Cannot get the last price of a token with id greater than SINGLE_EDITIONS_SUPPLY"
        );
        if (!exists(tokenId)) {
            return 0;
        }

        return _lastPrice[tokenId];
    }

    /**
     * @notice Only allowed for tokens with id <= SINGLE_EDITIONS_SUPPLY, because they are guaranteed to have a single edition
     * @dev Get the owner of a token with an id <= SINGLE_EDITIONS_SUPPLY
     * @param tokenId id of the token to get the owner of
     */
    function owner(uint256 tokenId) external view returns (address) {
        require(
            tokenId <= SINGLE_EDITIONS_SUPPLY,
            "Cannot get the owner for token with id greater than SINGLE_EDITIONS_SUPPLY"
        );

        if (!exists(tokenId)) {
            return address(0);
        }

        return _owner[tokenId];
    }

    /**
     * @dev Get the URI of a token
     * @param tokenId id of the token
     */
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
