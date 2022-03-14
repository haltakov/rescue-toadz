const { BigNumber } = require("@ethersproject/bignumber");
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("InfiniteAuctionUkraine", () => {
    let InfiniteAuctionUkraine;
    let contract;
    let owner;
    let addr1;

    beforeEach(async function () {
        InfiniteAuctionUkraine = await ethers.getContractFactory("InfiniteAuctionUkraine");
        [owner, addr1, addr2] = await ethers.getSigners();
        contract = await InfiniteAuctionUkraine.deploy();
    });

    it("should have a max supply of 10", async () => {
        expect(await contract.MAX_SUPPLY()).to.equal(3);
    });

    it("should have a mint price of 5 gwei", async () => {
        expect(await contract.MINT_PRICE()).to.equal(5 * 1e9);
    });

    it("should have set the payee to Ukrainian charity", async () => {
        expect(await contract.PAYEE_ADDRESS()).to.equal("0x165CD37b4C644C2921454429E7F9358d18A45e14");
    });

    it("should mint token", async () => {
        await contract.connect(addr1).mint(1, { value: 5 * 1e9 });

        expect(await contract.balanceOf(addr1.address, 1)).to.equal(1);
    });

    it("should not mint more than max supply", async () => {
        await expect(contract.mint(await contract.MAX_SUPPLY(), { value: 5 * 1e9 })).to.not.be.reverted;

        await expect(contract.mint((await contract.MAX_SUPPLY()) + 1, { value: 5 * 1e9 })).to.be.revertedWith(
            "VM Exception while processing transaction: reverted with reason string 'Cannot mint token with id greater than MAX_SUPPLY'"
        );
    });

    it("should not mint if not enough funds are sent", async () => {
        await expect(contract.mint(1, { value: 5 * 1e9 })).to.not.be.reverted;

        await expect(contract.mint(2, { value: 49 * 1e8 })).to.be.revertedWith(
            "VM Exception while processing transaction: reverted with reason string 'Not enough funds to mint token'"
        );
    });

    it("should not mintexisting token", async () => {
        await expect(contract.mint(1, { value: 5 * 1e9 })).to.not.be.reverted;

        await expect(contract.mint(1, { value: 5 * 1e9 })).to.be.revertedWith(
            "VM Exception while processing transaction: reverted with reason string 'Token already minted'"
        );
    });

    it("should not mint token 0", async () => {
        await expect(contract.mint(0, { value: 5 * 1e9 })).to.be.revertedWith(
            "VM Exception while processing transaction: reverted with reason string 'Cannot mint token 0'"
        );
    });

    it("should return the specified tokenURI", async () => {
        await contract.mint(1, { value: 5 * 1e9 });

        expect(await contract.uri(1)).to.equal("ipfs://QmUsn9qqDbzYC5rMVdcvPk3yhRhPsPLh2Um2NmCHtdRUKQ/1");
    });

    it("should return the last price", async () => {
        expect(await contract.lastPrice(1)).to.equal(0);

        await contract.mint(1, { value: 5 * 1e9 });

        expect(await contract.lastPrice(1)).to.equal(5 * 1e9);
    });

    it("should update the last price after capture", async () => {
        await contract.mint(1, { value: 5 * 1e9 });
        await contract.connect(addr1).capture(1, { value: 10 * 1e9 });

        expect(await contract.lastPrice(1)).to.equal(10 * 1e9);
    });

    it("should not capture token that is not minted", async () => {
        await expect(contract.capture(1, { value: 10 * 1e9 })).to.be.revertedWith(
            "VM Exception while processing transaction: reverted with reason string 'Cannot capture a token that is not minted'"
        );
        await contract.mint(1, { value: 5 * 1e9 });
        await expect(contract.capture(1, { value: 10 * 1e9 })).to.not.be.reverted;
    });

    it("should capture token if a higher price is offered", async () => {
        await contract.mint(1, { value: 5 * 1e9 });

        await expect(contract.connect(addr1).capture(1, { value: 5 * 1e9 })).to.be.revertedWith(
            "VM Exception while processing transaction: reverted with reason string 'Cannot capture token without paying more than the last price'"
        );

        await expect(contract.connect(addr1).capture(1, { value: 6 * 1e9 })).to.not.be.reverted;

        await expect(contract.capture(1, { value: 6 * 1e9 })).to.be.revertedWith(
            "VM Exception while processing transaction: reverted with reason string 'Cannot capture token without paying more than the last price'"
        );

        await expect(contract.capture(1, { value: 7 * 1e9 })).to.not.be.reverted;
    });

    it("should transfer mint funds to the payee", async () => {
        const payeeBalace = await (await ethers.provider.getBalance(await contract.PAYEE_ADDRESS())).toNumber();
        await contract.mint(1, { value: 5 * 1e9 });
        const newPayeeBalace = await (await ethers.provider.getBalance(await contract.PAYEE_ADDRESS())).toNumber();
        expect(newPayeeBalace).to.greaterThan(payeeBalace);
    });

    it("should transfer capture funds to the payee", async () => {
        await contract.mint(1, { value: 5 * 1e9 });

        const payeeBalace = await (await ethers.provider.getBalance(await contract.PAYEE_ADDRESS())).toNumber();
        await contract.connect(addr1).capture(1, { value: 10 * 1e9 });

        const newPayeeBalace = await (await ethers.provider.getBalance(await contract.PAYEE_ADDRESS())).toNumber();
        expect(newPayeeBalace).to.greaterThan(payeeBalace);
    });

    it("should no create POAP before capture", async () => {
        expect(await contract.totalSupply(4)).to.equal(0);

        await contract.mint(1, { value: 5 * 1e9 });

        expect(await contract.totalSupply(4)).to.equal(0);

        await contract.connect(addr1).capture(1, { value: 10 * 1e9 });

        expect(await contract.totalSupply(4)).to.equal(1);
        expect(await contract.balanceOf(owner.address, 4)).to.equal(1);
    });

    it("should create POAP with correct token ID", async () => {
        expect(await contract.totalSupply(4)).to.equal(0);
        await contract.mint(1, { value: 5 * 1e9 });
        await contract.connect(addr1).capture(1, { value: 10 * 1e9 });
        expect(await contract.totalSupply(4)).to.equal(1);

        expect(await contract.totalSupply(5)).to.equal(0);
        await contract.mint(2, { value: 5 * 1e9 });
        await contract.connect(addr1).capture(2, { value: 10 * 1e9 });
        expect(await contract.totalSupply(5)).to.equal(1);

        expect(await contract.totalSupply(6)).to.equal(0);
        await contract.mint(3, { value: 5 * 1e9 });
        await contract.connect(addr1).capture(3, { value: 10 * 1e9 });
        expect(await contract.totalSupply(6)).to.equal(1);
    });
});
