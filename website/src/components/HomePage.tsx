import React from "react";
import { BigNumber, ethers } from "ethers";

import { CONTRACT_ADDRESS, COLLECTION_SIZE, ContractError } from "./SmartContract/SmartContract";

import {
    Collection,
    ConnectWallet,
    Explanation,
    FAQ,
    MainContainer,
    NFT,
    NFTButtonContainer,
    QuestionsContainer,
    Notification,
    ImportantInfo,
} from "./HomePage.styles";

import { ContractHandler, useContractHandler } from "./SmartContract/SmartContract";
import { nth, reduceRight } from "lodash";

const OPENSEA_URL = process.env.REACT_APP_OPENSEA_URL || "https://opensea.io";

type NFT = {
    id: number;
    name: string;
    image: string;
    link: string;
    lastPrice: BigNumber;
    owner: string;
};

type NotificationMessage = {
    type: "success" | "error";
    message: string;
};

const createCollection = (): NFT[] => {
    return Array.from(Array(COLLECTION_SIZE).keys()).map((id) => ({
        id: id + 1,
        name: `Ukraine Toad #${id + 1}`,
        image: `/nft/${id + 1}.jpg`,
        link: `${OPENSEA_URL}/assets/${CONTRACT_ADDRESS}/${id + 1}`,
        lastPrice: BigNumber.from(0),
        owner: ethers.constants.AddressZero,
    }));
};

const updateCollection = async (collection: NFT[], contractHandler: ContractHandler): Promise<NFT[]> => {
    return Promise.all(
        collection.map(async (nft) => {
            const lastPrice = await contractHandler.lastPrice(nft.id);
            const owner = await contractHandler.owner(nft.id);
            return { ...nft, lastPrice: lastPrice, owner: owner };
        })
    );
};

const HomePage = () => {
    const [address, setAddress] = React.useState<string>("");
    const [collection, setCollection] = React.useState<NFT[]>(createCollection());
    const [loadingButton, setLoadingButton] = React.useState<number>(0);
    const [notificationMessage, setNotificationMessage] = React.useState<NotificationMessage | null>(null);

    const [donateMore, showDonateMore] = React.useReducer((state: boolean[], action: number) => {
        const newState = [...state];
        newState[action] = true;
        return newState;
    }, Array(COLLECTION_SIZE).fill(false));

    const contractHandler = useContractHandler();

    const inputRefs = Array.from(Array(COLLECTION_SIZE).keys()).map((id) => React.useRef<HTMLInputElement>(null));

    const handleContractInteractionButton = React.useCallback(
        async (
            nftId: number,
            contractFunction: () => Promise<ContractError>,
            contractHandler: ContractHandler,
            successMessage: string,
            errorMessage: string
        ) => {
            setLoadingButton(nftId);

            if (!contractHandler.hasSigner()) setAddress(await contractHandler.connectWallet());

            const result = await contractFunction();

            switch (result) {
                case ContractError.None:
                    setNotificationMessage({ type: "success", message: successMessage });
                    break;
                case ContractError.NotEnoughBalance:
                    setNotificationMessage({ type: "error", message: "Not enough funds in the wallet" });
                    break;
                case ContractError.NotMatchedDonation:
                    setNotificationMessage({ type: "error", message: "Last donation not matched" });
                    break;
                case ContractError.Other:
                    setNotificationMessage({ type: "error", message: errorMessage });
                    break;
            }

            setTimeout(() => setNotificationMessage(null), 5000);

            setLoadingButton(0);

            setCollection(await updateCollection(collection, contractHandler));
        },
        []
    );

    const handleMintButton = React.useCallback(async (id: number) => {
        handleContractInteractionButton(
            id,
            () => contractHandler.mintToken(id),
            contractHandler,
            "Toad minted successfully",
            "Minting failed"
        );
    }, []);

    const handleMatchButton = React.useCallback(async (id: number, lastPrice: BigNumber) => {
        handleContractInteractionButton(
            id,
            () => contractHandler.captureToken(id, lastPrice),
            contractHandler,
            "Donation matched successfully",
            "Donation failed"
        );
    }, []);

    const handleDonateMoreButton = React.useCallback(async (id: number) => {
        const userValue = ethers.utils.parseUnits(inputRefs[id - 1].current?.value || "0", "ether");

        handleContractInteractionButton(
            id,
            () => contractHandler.captureToken(id, userValue),
            contractHandler,
            "Donation successful",
            "Donation failed"
        );
    }, []);

    React.useEffect(() => {
        (async () => {
            setCollection(await updateCollection(collection, contractHandler));
        })();
    }, []);

    return (
        <MainContainer>
            <Explanation>
                <h3>
                    These toadz are looking for a temporary place to stay, do you have spare room in your wallet? They
                    promise to be the perfect guest!
                </h3>

                <p>
                    Simply <strong>mint a toad by donating 0.01 eth</strong>, and it will gratefully hop straight into
                    your wallet.
                    <br /> You can also <strong>offer to host</strong> an already minted toad in your wallet by{" "}
                    <strong>matching or increasing the last donation</strong>. It will bid you a fond farewell to its
                    previous host and leave them a <strong>pair of glasses as a memento</strong>
                </p>

                <p>
                    100% of the funds raised go directly via{" "}
                    <a href="https://unchain.fund/" target="_blank">
                        Unchain
                    </a>{" "}
                    to the Ukraine humanitarian effort
                </p>
            </Explanation>

            <ConnectWallet>
                {!contractHandler.getProvider() && (
                    <p>
                        Please install{" "}
                        <a href="https://metamask.io" target="_blank">
                            MetaMask
                        </a>{" "}
                        to interact with the website
                    </p>
                )}
                {contractHandler.getProvider() && !contractHandler.hasSigner() && (
                    <button
                        onClick={async () => {
                            setAddress(await contractHandler.connectWallet());
                            setCollection(await updateCollection(collection, contractHandler));
                        }}
                    >
                        Connect wallet
                    </button>
                )}
                {contractHandler.hasSigner() && (
                    <p>
                        Connected wallet: {address} (
                        <a
                            onClick={() => {
                                contractHandler.disconnectWallet();
                                setAddress("");
                            }}
                        >
                            disconnect
                        </a>
                        )
                    </p>
                )}
            </ConnectWallet>

            <Collection>
                {collection.map((nft) => (
                    <NFT key={nft.id}>
                        <a
                            {...(nft.lastPrice.gt(0)
                                ? { href: `${OPENSEA_URL}/assets/${CONTRACT_ADDRESS}/${nft.id}`, target: "_blank" }
                                : {})}
                        >
                            <div>
                                <img src={nft.image} alt={nft.name} />
                                <img
                                    className="hover-image"
                                    src={`/nft/${nft.id + COLLECTION_SIZE}.jpg`}
                                    alt={nft.name + " glasses"}
                                />
                            </div>
                        </a>
                        {!nft.lastPrice.eq(0) && (
                            <h4>
                                Owned by{" "}
                                <a href={`${OPENSEA_URL}/assets/${CONTRACT_ADDRESS}/${nft.id}`}>
                                    {nft.owner.slice(2, 8).toUpperCase()}
                                </a>{" "}
                                for donating <strong>{ethers.utils.formatEther(nft.lastPrice)} ETH</strong>
                            </h4>
                        )}
                        <NFTButtonContainer>
                            {contractHandler.getProvider() && nft.lastPrice.eq(0) && (
                                <button onClick={() => handleMintButton(nft.id)} disabled={loadingButton === nft.id}>
                                    {loadingButton === nft.id ? "Minting..." : "Mint"}
                                </button>
                            )}
                            {!nft.lastPrice.eq(0) && !donateMore[nft.id - 1] && (
                                <>
                                    <button
                                        onClick={() => handleMatchButton(nft.id, nft.lastPrice)}
                                        disabled={loadingButton === nft.id}
                                    >
                                        {loadingButton === nft.id ? "Donating..." : "Match Donation"}
                                    </button>
                                    <button onClick={() => showDonateMore(nft.id - 1)}>
                                        {loadingButton === nft.id ? "Donating..." : "Donate More"}
                                    </button>
                                </>
                            )}
                            {!nft.lastPrice.eq(0) && donateMore[nft.id - 1] && (
                                <>
                                    <input
                                        ref={inputRefs[nft.id - 1]}
                                        type="text"
                                        placeholder={`${ethers.utils.formatEther(nft.lastPrice)} ETH`}
                                    />
                                    <button
                                        onClick={() => handleDonateMoreButton(nft.id)}
                                        disabled={loadingButton === nft.id}
                                    >
                                        {loadingButton === nft.id ? "Donating..." : "Donate"}
                                    </button>
                                </>
                            )}
                        </NFTButtonContainer>
                    </NFT>
                ))}
            </Collection>

            <FAQ>
                <h3>FAQ</h3>
                <QuestionsContainer>
                    <div>
                        <h4>Do I get an NFT if I mint a toad?</h4>
                        <p>Yes, you will get an NFT with the specific image of the toad that you chose to mint.</p>
                    </div>
                    <div>
                        <h4>All toadz are minted, now what?</h4>
                        <p>
                            You can either match or increase the last donation for a toad and it will directly hop into
                            your wallet.
                        </p>
                    </div>
                    <div>
                        <h4>What if somebody donates more?</h4>
                        <p>
                            Your toad will move to the wallet that donated more. It will leave you a pair of NFT glasses
                            as a memento, though.
                        </p>
                    </div>
                    <div>
                        <h4>Can I stop a toad leaving my wallet?</h4>
                        <p>
                            No. This is a novel feature we coded into the{" "}
                            <a
                                href="https://etherscan.io/address/0x57605D3A2C7726e9A7801307AF0C893bA5199F66#code"
                                target="_blank"
                            >
                                smart contract
                            </a>
                            . This encourages people to donate more.
                        </p>
                    </div>

                    <div>
                        <h4>Can I sell my toad or my glasses?</h4>
                        <p>
                            No. Listing the toadz and the glasses on a secondary exchange like OpenSea is blocked in the
                            contract.
                        </p>
                    </div>

                    <div>
                        <h4>What happens with the funds?</h4>
                        <p>
                            100% of the collected funds go to{" "}
                            <a href="https://unchain.fund/" target="_blank">
                                Unchain Ukraine
                            </a>
                            . This happens right away directly in the{" "}
                            <a
                                href="https://etherscan.io/address/0x57605D3A2C7726e9A7801307AF0C893bA5199F66#code"
                                target="_blank"
                            >
                                smart contract
                            </a>
                            .
                        </p>
                    </div>
                </QuestionsContainer>
            </FAQ>

            <ImportantInfo>
                <h3>Important Links</h3>
                <ul>
                    <li>
                        <strong>Smart contract</strong>{" "}
                        <a
                            target="_blank"
                            href="https://etherscan.io/address/0x57605D3A2C7726e9A7801307AF0C893bA5199F66"
                        >
                            0x57605D3A2C7726e9A7801307AF0C893bA5199F66
                        </a>
                    </li>

                    <li>
                        <strong>Charity</strong>{" "}
                        <a target="_blank" href="https://unchain.fund/">
                            Unchain Ukraine
                        </a>{" "}
                        (0x10E1439455BD2624878b243819E31CfEE9eb721C)
                    </li>

                    <li>
                        <strong>OpenSea collection</strong>{" "}
                        <a target="_blank" href="https://opensea.io/collection/rescue-toadz">
                            Rescue Toadz
                        </a>{" "}
                        (secondary sales are disabled)
                    </li>

                    <li>
                        <strong>Project code</strong>{" "}
                        <a target="_blank" href="https://github.com/haltakov/rescue-toadz">
                            GitHub repository
                        </a>
                    </li>

                    <li>
                        <strong>Team</strong>{" "}
                        <a target="_blank" href="https://twitter.com/haltakov">
                            @haltakov
                        </a>{" "}
                        and{" "}
                        <a target="_blank" href="https://twitter.com/ianbydesign">
                            @ianbydesign
                        </a>
                    </li>
                </ul>
            </ImportantInfo>

            <Notification>
                {notificationMessage && <div className={notificationMessage.type}>{notificationMessage.message}</div>}
            </Notification>
        </MainContainer>
    );
};

export default HomePage;
