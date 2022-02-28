const { BigNumber } = require("@ethersproject/bignumber");
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("NFTforUkraine", () => {
    let NFTforUkraine;
    let contract;
    let owner;
    let addr1;

    beforeEach(async function () {
        NFTforUkraine = await ethers.getContractFactory("NFTforUkraine");
        [owner, addr1, addr2] = await ethers.getSigners();
        contract = await NFTforUkraine.deploy();
    });

    it("should have a max supply of 10", async () => {
        expect(await contract.MAX_SUPPLY()).to.equal(10);
    });

    it("should have a mint price of 5 gwei", async () => {
        expect(await contract.MINT_PRICE()).to.equal(5 * 1e9);
    });

    it("should mint token", async () => {
        await contract.connect(addr1).mint(1, {value: 5 * 1e9});

        expect(await contract.ownerOf(1)).to.equal(addr1.address);
    });

    it("should not mint more than max supply", async () => {
        await expect(contract.mint(10, {value: 5 * 1e9})).to.not.be.reverted;

        await expect(contract.mint(11, {value: 5 * 1e9})).to.be.revertedWith(
            "VM Exception while processing transaction: reverted with reason string 'Cannot mint token with id greater than MAX_SUPPLY'"
        );
    });

    it("should not mint if not enough funds are sent", async () => {
        await expect(contract.mint(1, {value: 5 * 1e9})).to.not.be.reverted;

        await expect(contract.mint(2, {value: 49 * 1e8})).to.be.revertedWith(
            "VM Exception while processing transaction: reverted with reason string 'Not enough funds to mint token'"
        );
    });

    it("should not mintexisting token", async () => {
        await expect(contract.mint(1, {value: 5 * 1e9})).to.not.be.reverted;

        await expect(contract.mint(1, {value: 5 * 1e9})).to.be.revertedWith(
            "VM Exception while processing transaction: reverted with reason string 'Token already minted'"
        );
    });

    it("should not mint token 0", async () => {
        await expect(contract.mint(0, {value: 5 * 1e9})).to.be.revertedWith(
            "VM Exception while processing transaction: reverted with reason string 'Cannot mint token 0'"
        );
    });

    it("should return the specified tokenURI", async () => {
        await contract.mint(1, {value: 5 * 1e9});



        expect(await contract.tokenURI(1)).to.equal("ipfs://QmcSefU1XkQb4qyGaP3zJyYVVSgocn1JFXGWGUNt6rP32u/1");
    });
});
