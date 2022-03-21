import React from "react";
import { BigNumber, ethers } from "ethers";

import { CONTRACT_ADDRESS, COLLECTION_SIZE } from "./SmartContract/SmartContract";

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
        link: `https://opensea.io/assets/${CONTRACT_ADDRESS}/${id + 1}`,
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

    const contractHandler = useContractHandler();

    const inputRefs = Array.from(Array(COLLECTION_SIZE).keys()).map((id) => React.useRef<HTMLInputElement>(null));

    const handleContractInteractionButton = React.useCallback(
        async (
            nftId: number,
            contractFunction: () => Promise<boolean>,
            successMessage: string,
            errorMessage: string
        ) => {
            setLoadingButton(nftId);

            const result = await contractFunction();

            if (result) {
                setNotificationMessage({
                    type: "success",
                    message: successMessage,
                });
            } else {
                setNotificationMessage({
                    type: "error",
                    message: errorMessage,
                });
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
            "Toad minted successfully",
            "Minting failed"
        );
    }, []);

    const handleCaptureButton = React.useCallback(async (id: number, lastPrice: BigNumber) => {
        const userValue = ethers.utils.parseUnits(inputRefs[id - 1].current?.value || "0", "ether");

        if (userValue.lt(lastPrice)) {
            setNotificationMessage({
                type: "error",
                message: "You need to donate more than the last donation",
            });
            setTimeout(() => setNotificationMessage(null), 5000);
        } else {
            handleContractInteractionButton(
                id,
                () => contractHandler.captureToken(id, userValue),
                "Toad lured successfully",
                "Luring failed"
            );
        }
    }, []);

    React.useEffect(() => {
        (async () => {
            setCollection(await updateCollection(collection, contractHandler));
        })();
    }, []);

    return (
        <MainContainer>
            <Explanation>
                <p>
                    <strong>Mint</strong> any toad donating 100% of the funds to Ukraine.
                </p>
                <p>
                    <strong>Lure</strong> any toad in your wallet by donating more than the previous owner.
                </p>
                <p>
                    If your toad hops to another wallet, it will <strong>drop its glasses</strong> an NFT memento for
                    your donation.
                </p>
            </Explanation>

            <ConnectWallet>
                {!contractHandler.hasProvider() && (
                    <p>
                        Please install{" "}
                        <a href="https://metamask.io" target="_blank">
                            MetaMask
                        </a>{" "}
                        to interact with the website
                    </p>
                )}
                {contractHandler.hasProvider() && !contractHandler.hasSigner() && (
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
                            <a
                                target="_blank"
                                href={`https://testnets.opensea.io/assets/${CONTRACT_ADDRESS}/${nft.id}`}
                            >
                                <img src={nft.image} alt={nft.name} />
                            </a>
                        )}
                        {!nft.lastPrice.gt(0) && <img src={nft.image} alt={nft.name} />}
                        <h4>
                            {!nft.lastPrice.eq(0) && (
                                <>
                                    Owned by{" "}
                                    <a href={`https://testnets.opensea.io/assets/${CONTRACT_ADDRESS}/${nft.id}`}>
                                        {nft.owner.slice(2, 8).toUpperCase()}
                                    </a>{" "}
                                    for donating <strong>{ethers.utils.formatEther(nft.lastPrice)} ETH</strong>
                                </>
                            )}
                        </h4>
                        <NFTButtonContainer>
                            {contractHandler.hasProvider() && nft.lastPrice.eq(0) && (
                                <button onClick={() => handleMintButton(nft.id)} disabled={loadingButton === nft.id}>
                                    {loadingButton === nft.id ? "Minting..." : "Mint"}
                                </button>
                            )}
                            {!nft.lastPrice.eq(0) && (
                                <>
                                    <input
                                        ref={inputRefs[nft.id - 1]}
                                        type="text"
                                        placeholder={`${ethers.utils.formatEther(nft.lastPrice)} ETH`}
                                    />
                                    <button
                                        onClick={() => handleCaptureButton(nft.id, nft.lastPrice)}
                                        disabled={loadingButton === nft.id}
                                    >
                                        {loadingButton === nft.id ? "Luring..." : "Lure"}
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
                        <h4>How can my toad hop in another wallet?</h4>
                        <p>
                            This is a novel mechanics we implemented. When somebody donates more for your toad than what
                            you donated, it will hop into the other wallet.
                        </p>
                    </div>
                    <div>
                        <h4>So, I will not own the toad anymore?</h4>
                        <p>
                            Yes. Your toad will be automatically transwered into the wallet that donated more. However,
                            it will drop its glasses as a memento for your donation.
                        </p>
                    </div>
                    <div>
                        <h4>Why should I mint or buy a toad?</h4>
                        <p>
                            Because 100% of the funds from minting or luring toadz are used as donations for
                            humanitarian help in Ukraine. And you get an NFT as a certificate of your donation.
                        </p>
                    </div>

                    <div>
                        <h4>What is your roadmap?</h4>
                        <p>
                            We want to raise money for Ukraine and we want to do it in a way that incentives people to
                            give more. Consider both as implemented.
                        </p>
                    </div>
                    <div>
                        <h4>How am I sure all funds go to Ukraine?</h4>
                        <p>
                            100% of the funds for minting or luring toadz, are automatically donated directly in the{" "}
                            <a
                                href="https://rinkeby.etherscan.io/address/0xD6E8Be3A4C0dcaA6430B3dE9549591EE0F3EC21c#code"
                                target="_blank"
                            >
                                smart contract
                            </a>
                            . No need to trust us, trust the code!
                        </p>
                    </div>
                    <div>
                        <h4>Where do the funds go?</h4>
                        <p>
                            All funds are used for humanitarian help by donating them to ... (Still need to choose the
                            exact organization)
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
