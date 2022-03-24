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
} from "./HomePage.styles";

import { ContractHandler, useContractHandler } from "./SmartContract/SmartContract";
import { nth, reduceRight } from "lodash";

const OPENSEA_URL = process.env.REACT_APP_OPENSEA_URL || "https://testnets.opensea.io";

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
                    <strong>Mint a toad</strong> by donating 0.01 eth and put it up in your wallet
                </p>
                <p>
                    Offer a toad to stay with you by <strong>matching the last donation</strong> or donating more
                </p>
                <p>
                    Once a toad hops off to another wallet it will leave you a{" "}
                    <strong>pair of glasses as memento</strong>
                </p>
                <p>
                    <strong>100% of the funds</strong> raised go directly to the Ukraine
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
                        <h3>{nft.name}</h3>
                        {nft.lastPrice.gt(0) && (
                            <a target="_blank" href={`${OPENSEA_URL}/assets/${CONTRACT_ADDRESS}/${nft.id}`}>
                                <img src={nft.image} alt={nft.name} />
                            </a>
                        )}
                        {!nft.lastPrice.gt(0) && <img src={nft.image} alt={nft.name} />}
                        <h4>
                            {!nft.lastPrice.eq(0) && (
                                <>
                                    Owned by{" "}
                                    <a href={`${OPENSEA_URL}/assets/${CONTRACT_ADDRESS}/${nft.id}`}>
                                        {nft.owner.slice(2, 8).toUpperCase()}
                                    </a>{" "}
                                    for donating <strong>{ethers.utils.formatEther(nft.lastPrice)} ETH</strong>
                                </>
                            )}
                        </h4>
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
                        <p>Yes, you will get an NFT with the image of the toad that you minted.</p>
                    </div>
                    <div>
                        <h4>All toadz are minted, can I get one?</h4>
                        <p>
                            Yes, you can either match the last donation for a toad or donate more. It will them hop in
                            your wallet.
                        </p>
                    </div>
                    <div>
                        <h4>What if somebody donates more?</h4>
                        <p>
                            Your toad will be transferred to the wallet that donated more. It will leave its glasses as
                            a memento, though.
                        </p>
                    </div>
                    <div>
                        <h4>What are these glasses?</h4>
                        <p>
                            The glasses are an NFT, but aren't unique as the toadz. Everybody that held the toad has the
                            same glasses.
                        </p>
                    </div>
                    <div>
                        <h4>Can I stop the toad leaving my wallet?</h4>
                        <p>
                            No, you can't stop the toad from hopping of to another wallet if somebody matches your
                            donation.
                        </p>
                    </div>

                    <div>
                        <h4>Where do the funds go?</h4>
                        <p>
                            100% of the collected funds go to ORGANIZATION. This happens instanntly in the{" "}
                            <a
                                href="https://rinkeby.etherscan.io/address/0x95F512513A7550E54AD3cC92640001B6Fe9aA378#code"
                                target="_blank"
                            >
                                smart contract
                            </a>
                            .
                        </p>
                    </div>
                </QuestionsContainer>
            </FAQ>

            <Notification>
                {notificationMessage && <div className={notificationMessage.type}>{notificationMessage.message}</div>}
            </Notification>
        </MainContainer>
    );
};

export default HomePage;
