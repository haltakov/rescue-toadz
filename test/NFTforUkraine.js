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

    it("should have set the payee to Ukrainian charity", async () => {
        expect(await contract.PAYEE_ADDRESS()).to.equal("0x9fecC154ABa86dB310cC3A81bb65f81155d6Bf98");
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

    it("should not buy token that is not minted", async () => {
        await expect(contract.buy(1, {value: 10 * 1e9})).to.be.revertedWith("VM Exception while processing transaction: reverted with reason string 'Cannot buy a token that is not minted'");
        await contract.mint(1, {value: 5 * 1e9});
        await expect(contract.buy(1, {value: 10 * 1e9})).to.not.be.reverted;
    });

    it("should buy token if a higher price is offered", async () => {
        await contract.mint(1, {value: 5 * 1e9});

        await expect(contract.connect(addr1).buy(1, {value: 5 * 1e9})).to.be.revertedWith(
            "VM Exception while processing transaction: reverted with reason string 'Cannot buy token without paying more than the last price'"
        );

        await expect(contract.connect(addr1).buy(1, {value: 6 * 1e9})).to.not.be.reverted

        await expect(contract.buy(1, {value: 6 * 1e9})).to.be.revertedWith(
            "VM Exception while processing transaction: reverted with reason string 'Cannot buy token without paying more than the last price'"
        );

        await expect(contract.buy(1, {value: 7 * 1e9})).to.not.be.reverted
    });
    
    it("should transfer mint funds to the payee", async () => {
        const payeeBalace = await (await ethers.provider.getBalance(await contract.PAYEE_ADDRESS())).toNumber();
        await contract.mint(1, {value: 5 * 1e9});
        const newPayeeBalace = await (await ethers.provider.getBalance(await contract.PAYEE_ADDRESS())).toNumber()
        expect(newPayeeBalace).to.greaterThan(payeeBalace);
    });

    it("should transfer buy funds to the payee", async () => {
        await contract.mint(1, {value: 5 * 1e9});

        const payeeBalace = await (await ethers.provider.getBalance(await contract.PAYEE_ADDRESS())).toNumber();
        await contract.connect(addr1).buy(1, {value: 10 * 1e9});

        const newPayeeBalace = await (await ethers.provider.getBalance(await contract.PAYEE_ADDRESS())).toNumber()
        expect(newPayeeBalace).to.greaterThan(payeeBalace);
    });
});
