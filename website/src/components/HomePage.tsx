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

import { BigNumber, ethers } from "ethers";
import React from "react";
import { ContractHandler, useContractHandler } from "./SmartContract/SmartContract";
import { Link } from "react-router-dom";

const CONTRACT = "0x1Fce02c44E51843a142B9a0d909FEe6c43E70549";

const COLLECTION_SIZE = 12;

type NFT = {
    id: number;
    name: string;
    image: string;
    link: string;
    lastPrice: BigNumber;
};

type NotificationMessage = {
    type: "success" | "error";
    message: string;
};

const createCollection = (): NFT[] => {
    return Array.from(Array(COLLECTION_SIZE).keys()).map((id) => ({
        id: id + 1,
        name: `Infinite Auction for Ukraine #${id + 1}`,
        image: `/nft/${id + 1}.jpg`,
        link: `https://opensea.io/assets/${CONTRACT}/${id + 1}`,
        lastPrice: BigNumber.from(0),
    }));
};

const updateCollection = async (collection: NFT[], contractHandler: ContractHandler): Promise<NFT[]> => {
    return Promise.all(
        collection.map(async (nft) => {
            const lastPrice = await contractHandler.lastPrice(nft.id);
            console.log(lastPrice);
            return { ...nft, lastPrice: lastPrice };
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
        },
        []
    );

    const handleMintButton = React.useCallback(async (id: number) => {
        handleContractInteractionButton(
            id,
            () => contractHandler.mintToken(id),
            "Token minted successfully",
            "Minting failed"
        );
    }, []);

    const handleCaptureButton = React.useCallback(async (id: number, lastPrice: BigNumber) => {
        const userValue = ethers.utils.parseUnits(inputRefs[id - 1].current?.value || "0", "ether");

        if (userValue < lastPrice) {
            setNotificationMessage({
                type: "error",
                message: "You need to pay more than the last price",
            });
            setTimeout(() => setNotificationMessage(null), 5000);
        } else {
            handleContractInteractionButton(
                id,
                () => contractHandler.captureToken(id, userValue),
                "Token captured successfully",
                "Capture failed"
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
                    <strong>Mint</strong> any NFT you like.{" "}
                </p>
                <p>
                    <strong>Capture</strong> a minted NFT by paying more.{" "}
                </p>
                <p>
                    Anybody can <strong>capture</strong> your NFT by paying more.
                </p>
                <p>
                    Can you <strong>hodl</strong> to your NFT without anybody outpaying you?
                </p>
            </Explanation>

            <ConnectWallet>
                {!contractHandler.hasSigner() && (
                    <button onClick={async () => setAddress(await contractHandler.connectWallet())}>
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
                            <a target="_blank" href={`https://testnets.opensea.io/assets/${CONTRACT}/${nft.id}`}>
                                <img src={nft.image} alt={nft.name} />
                            </a>
                        )}
                        {!nft.lastPrice.gt(0) && <img src={nft.image} alt={nft.name} />}
                        <h4>
                            {!nft.lastPrice.eq(0) && (
                                <>
                                    Last bought by{" "}
                                    <a href={`https://testnets.opensea.io/assets/${CONTRACT}/${nft.id}`}>0x00000</a> for{" "}
                                    <strong>{ethers.utils.formatEther(nft.lastPrice)} ETH</strong>
                                </>
                            )}
                        </h4>
                        <NFTButtonContainer>
                            {nft.lastPrice.eq(0) && (
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
                                        {loadingButton === nft.id ? "Capturing..." : "Capture"}
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
                        <h4>How can someone take my NFT?</h4>
                        <p>
                            This is a novel feature coded directly in the smart contract. As soon as somebody pays more
                            fot the NFT it will be transferred to their wallet.
                        </p>
                    </div>
                    <div>
                        <h4>Can I make money from this?</h4>
                        <p>
                            No. All funds from sales will automatically be transfered to the Ukraine wallet. Consider
                            all the money you pay as a donation.
                        </p>
                    </div>
                    <div>
                        <h4>Why should I buy your NFT??</h4>
                        <p>There are two reasons:</p>
                        <p>1. You help Ukrain recover from the war.</p>
                        <p>2. You keep the NFT if nobody pays more than you for it.</p>
                    </div>

                    <div>
                        <h4>What is your roadmap?</h4>
                        <p>
                            We want to raise money for Ukraine and we want to do it in a way that incentives people to
                            give more. Consider both as implemented.
                        </p>
                    </div>
                    <div>
                        <h4>Are all funds donated to Ukraine?</h4>
                        <p>
                            Yes! 100% of the funds for minting or buying the NFT, as well as 100% of the secondary sales
                            are transfered to charity directly in the{" "}
                            <a
                                href="https://rinkeby.etherscan.io/address/0xD6E8Be3A4C0dcaA6430B3dE9549591EE0F3EC21c#code"
                                target="_blank"
                            >
                                smart contract
                            </a>
                            .
                        </p>
                    </div>
                    <div>
                        <h4>Where do the funds go?</h4>
                        <p>All funds are transfered to the official Ukrainian Ethereum donations wallet:</p>
                        <p>
                            <small>0x165CD37b4C644C2921454429E7F9358d18A45e14</small>.
                        </p>
                        <p>
                            See{" "}
                            <a href="https://twitter.com/Ukraine/status/1497594592438497282" target="_blank">
                                this tweet
                            </a>{" "}
                            for details.
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
