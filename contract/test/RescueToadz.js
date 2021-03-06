const { BigNumber } = require("@ethersproject/bignumber");
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("RescueToadz", () => {
    let RescueToadz;
    let contract;
    let owner;
    let addr1;
    const mintPrice = BigNumber.from("10000000000000000"); // 0.005 ETH
    const singleEditionsSupply = 18;

    beforeEach(async function () {
        RescueToadz = await ethers.getContractFactory("RescueToadz");
        [owner, addr1, addr2] = await ethers.getSigners();
        contract = await RescueToadz.deploy();
    });

    it("should return the name of the token", async () => {
        expect(await contract.name()).to.equal("Rescue Toadz");
    });

    it("should have a max supply of 10", async () => {
        expect(await contract.SINGLE_EDITIONS_SUPPLY()).to.equal(singleEditionsSupply);
    });

    it("should have a mint price of 5 gwei", async () => {
        expect(await contract.MINT_PRICE()).to.equal(mintPrice);
    });

    it("should have set the payee to Ukrainian charity", async () => {
        expect(await contract.CHARITY_ADDRESS()).to.equal("0x10E1439455BD2624878b243819E31CfEE9eb721C");
    });

    it("should mint token", async () => {
        await contract.connect(addr1).mint(1, { value: mintPrice });

        expect(await contract.balanceOf(addr1.address, 1)).to.equal(1);
    });

    it("should get the owner of a token", async () => {
        expect(await contract.ownerOf(0)).to.equal(ethers.constants.AddressZero);
        expect(await contract.ownerOf(1)).to.equal(ethers.constants.AddressZero);

        await contract.connect(addr1).mint(1, { value: mintPrice });
        expect(await contract.ownerOf(1)).to.equal(addr1.address);
    });

    it("should not get the owner of a token with an id > SINGLE_EDITIONS_SUPPLY", async () => {
        await expect(contract.ownerOf(singleEditionsSupply + 1)).to.be.revertedWith(
            "VM Exception while processing transaction: reverted with reason string 'Cannot get the owner for token with id greater than SINGLE_EDITIONS_SUPPLY'"
        );
    });

    it("should not mint more than max supply", async () => {
        await expect(contract.mint(await contract.SINGLE_EDITIONS_SUPPLY(), { value: mintPrice })).to.not.be.reverted;

        await expect(
            contract.mint((await contract.SINGLE_EDITIONS_SUPPLY()) + 1, { value: mintPrice })
        ).to.be.revertedWith(
            "VM Exception while processing transaction: reverted with reason string 'Cannot mint token with id greater than SINGLE_EDITIONS_SUPPLY'"
        );
    });

    it("should not mint if not enough funds are sent", async () => {
        await expect(contract.mint(1, { value: mintPrice })).to.not.be.reverted;

        await expect(contract.mint(2, { value: mintPrice.sub(1) })).to.be.revertedWith(
            "VM Exception while processing transaction: reverted with reason string 'Not enough funds to mint token'"
        );
    });

    it("should not mintexisting token", async () => {
        await expect(contract.mint(1, { value: mintPrice })).to.not.be.reverted;

        await expect(contract.mint(1, { value: mintPrice })).to.be.revertedWith(
            "VM Exception while processing transaction: reverted with reason string 'Token already minted'"
        );
    });

    it("should not mint token 0", async () => {
        await expect(contract.mint(0, { value: mintPrice })).to.be.revertedWith(
            "VM Exception while processing transaction: reverted with reason string 'Cannot mint token 0'"
        );
    });

    it("should return the specified token uri", async () => {
        await contract.mint(1, { value: mintPrice });

        expect(await contract.uri(1)).to.equal("ipfs://QmXRvBcDGpGYVKa7DpshY4UJQrSHH4ArN2AotHHjDS3BHo/1");
    });

    it("should not get the uri for non-existing tokens", async () => {
        await expect(contract.uri(1)).to.be.revertedWith(
            "VM Exception while processing transaction: reverted with reason string 'URI query for nonexistent token'"
        );
    });

    it("should return the last price", async () => {
        expect(await contract.lastPrice(1)).to.equal(0);

        await contract.mint(1, { value: mintPrice });

        expect(await contract.lastPrice(1)).to.equal(mintPrice);
    });

    it("should update the last price after capture", async () => {
        await contract.mint(1, { value: mintPrice });
        await contract.connect(addr1).capture(1, { value: mintPrice.mul(2) });

        expect(await contract.lastPrice(1)).to.equal(mintPrice.mul(2));
    });

    it("should not return the last price for token with id > SINGLE_EDITIONS_SUPPLY", async () => {
        await contract.mint(1, { value: mintPrice });
        await contract.capture(1, { value: mintPrice.add(2) });

        await expect(contract.lastPrice(singleEditionsSupply + 1)).to.be.revertedWith(
            "VM Exception while processing transaction: reverted with reason string 'Cannot get the last price of a token with id greater than SINGLE_EDITIONS_SUPPLY'"
        );
    });

    it("should not capture token that is not minted", async () => {
        await expect(contract.capture(1, { value: mintPrice.mul(2) })).to.be.revertedWith(
            "VM Exception while processing transaction: reverted with reason string 'Cannot capture a token that is not minted'"
        );
        await contract.mint(1, { value: mintPrice });
        await expect(contract.capture(1, { value: mintPrice.mul(2) })).to.not.be.reverted;
    });

    it("should not capture token with an id > SINGLE_EDITION_SUPPLY", async () => {
        await contract.mint(1, { value: mintPrice });
        await contract.capture(1, { value: mintPrice.add(1) });

        await expect(contract.capture(singleEditionsSupply + 1, { value: mintPrice.add(2) })).to.be.revertedWith(
            "VM Exception while processing transaction: reverted with reason string 'Cannot capture a token with id greater than SINGLE_EDITIONS_SUPPLY'"
        );
    });

    it("should not capture token if a lower price is offered", async () => {
        await contract.mint(1, { value: mintPrice });

        await expect(contract.connect(addr1).capture(1, { value: mintPrice.sub(1) })).to.be.revertedWith(
            "VM Exception while processing transaction: reverted with reason string 'Cannot capture a token without paying at least the last price'"
        );
    });

    it("should capture token if the last price is matched", async () => {
        await contract.mint(1, { value: mintPrice });

        await expect(contract.connect(addr1).capture(1, { value: mintPrice })).to.not.be.reverted;
    });

    it("should capture token if a higher price is offered", async () => {
        await contract.mint(1, { value: mintPrice });

        await expect(contract.connect(addr1).capture(1, { value: mintPrice.add(1) })).to.not.be.reverted;

        await expect(contract.capture(1, { value: mintPrice })).to.be.revertedWith(
            "VM Exception while processing transaction: reverted with reason string 'Cannot capture a token without paying at least the last price'"
        );

        await expect(contract.capture(1, { value: mintPrice.add(2) })).to.not.be.reverted;
    });

    it("should transfer mint funds to the payee", async () => {
        const payeeBalace = await await ethers.provider.getBalance(await contract.CHARITY_ADDRESS());
        await contract.mint(1, { value: mintPrice });
        const newPayeeBalace = await await ethers.provider.getBalance(await contract.CHARITY_ADDRESS());
        expect(newPayeeBalace.gt(payeeBalace)).to.be.true;
    });

    it("should transfer capture funds to the payee", async () => {
        await contract.mint(1, { value: mintPrice });

        const payeeBalace = await await ethers.provider.getBalance(await contract.CHARITY_ADDRESS());
        await contract.connect(addr1).capture(1, { value: mintPrice.mul(2) });

        const newPayeeBalace = await await ethers.provider.getBalance(await contract.CHARITY_ADDRESS());
        expect(newPayeeBalace.gt(payeeBalace)).to.be.true;
    });

    it("should no create POAP before capture", async () => {
        expect(await contract.totalSupply(singleEditionsSupply + 1)).to.equal(0);

        await contract.mint(1, { value: mintPrice });

        expect(await contract.totalSupply(singleEditionsSupply + 1)).to.equal(0);

        await contract.connect(addr1).capture(1, { value: mintPrice.mul(2) });

        expect(await contract.totalSupply(singleEditionsSupply + 1)).to.equal(1);
        expect(await contract.balanceOf(owner.address, singleEditionsSupply + 1)).to.equal(1);
    });

    it("should create POAP with correct token ID", async () => {
        expect(await contract.totalSupply(singleEditionsSupply + 1)).to.equal(0);
        await contract.mint(1, { value: mintPrice });
        await contract.connect(addr1).capture(1, { value: mintPrice.mul(2) });
        expect(await contract.totalSupply(singleEditionsSupply + 1)).to.equal(1);

        expect(await contract.totalSupply(singleEditionsSupply + 2)).to.equal(0);
        await contract.mint(2, { value: mintPrice });
        await contract.connect(addr1).capture(2, { value: mintPrice.mul(2) });
        expect(await contract.totalSupply(singleEditionsSupply + 2)).to.equal(1);

        expect(await contract.totalSupply(singleEditionsSupply + 3)).to.equal(0);
        await contract.mint(3, { value: mintPrice });
        await contract.connect(addr1).capture(3, { value: mintPrice.mul(2) });
        expect(await contract.totalSupply(singleEditionsSupply + 3)).to.equal(1);
    });

    it("should not allow setApprovalForAll", async () => {
        await expect(contract.setApprovalForAll(addr1.address, 1)).to.be.revertedWith(
            "VM Exception while processing transaction: reverted with reason string 'setApprovalForAll is not supported'"
        );
    });

    it("should set the token URI", async () => {
        await contract.mint(1, { value: mintPrice });

        expect(await contract.uri(1)).to.equal("ipfs://QmXRvBcDGpGYVKa7DpshY4UJQrSHH4ArN2AotHHjDS3BHo/1");

        await contract.setURI("ipfs://Qxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx/");
        expect(await contract.uri(1)).to.equal("ipfs://Qxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx/1");
    });

    it("should only allow owner to set the token URI", async () => {
        await expect(contract.setURI("test")).to.not.be.reverted;

        await expect(contract.connect(addr1).setURI("test")).to.be.revertedWith(
            "VM Exception while processing transaction: reverted with reason string 'Ownable: caller is not the owner'"
        );
    });

    it("should pause and unpause the contract", async () => {
        await contract.pause();
        expect(await contract.paused()).to.equal(true);

        await contract.unpause();
        expect(await contract.paused()).to.equal(false);
    });

    it("should not mint when contract is paused", async () => {
        await contract.pause();

        await expect(contract.mint(1, { value: await mintPrice })).to.be.revertedWith(
            "VM Exception while processing transaction: reverted with reason string 'Pausable: paused'"
        );

        await contract.unpause();
        await expect(contract.mint(1, { value: await mintPrice })).to.not.be.reverted;
    });

    it("should not capture when contract is paused", async () => {
        await contract.mint(1, { value: await mintPrice });

        await contract.pause();
        await expect(contract.capture(1, { value: await mintPrice })).to.be.revertedWith(
            "VM Exception while processing transaction: reverted with reason string 'Pausable: paused'"
        );

        await contract.unpause();
        await expect(contract.capture(1, { value: await mintPrice })).to.not.be.reverted;
    });
});
