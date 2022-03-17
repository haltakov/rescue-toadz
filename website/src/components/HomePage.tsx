import {
    Collection,
    ConnectWallet,
    Explanation,
    FAQ,
    MainContainer,
    NFT,
    NFTButtonContainer,
    QuestionsContainer,
} from "./HomePage.styles";

import CONTRACT_ABI from "./contract_abi.json";

import { BigNumber, ethers } from "ethers";
import React from "react";

const COLLECTION_SIZE = 3;
const CONTRACT = "0xEf44dedA5A7e81F156D7dd64c19CD3117b19f042";

type NFT = {
    id: number;
    name: string;
    image: string;
    link: string;
    lastPrice: number;
};

const createCollection = (): NFT[] => {
    return Array.from(Array(COLLECTION_SIZE).keys()).map((id) => ({
        id: id + 1,
        name: `Infinite Auction for Ukraine #${id + 1}`,
        image: `/nft/${id + 1}.png`,
        link: `https://opensea.io/assets/${CONTRACT}/${id + 1}`,
        lastPrice: 0,
    }));
};

const updateCollection = async (collection: NFT[], contract: ethers.Contract): Promise<NFT[]> => {
    return Promise.all(
        collection.map(async (nft) => {
            const lastPrice = await contract.lastPrice(nft.id);
            return { ...nft, lastPrice: lastPrice.toNumber() };
        })
    );
};

const mintToken = async (
    id: number,
    signer: ethers.providers.JsonRpcSigner | null,
    contract: ethers.Contract | null
) => {
    if (contract && signer) {
        const tx = await contract.connect(signer).mint(id, { value: await contract.MINT_PRICE() });
        console.log(tx);
    }
};

const captureToken = async (
    id: number,
    value: number,
    signer: ethers.providers.JsonRpcSigner | null,
    contract: ethers.Contract | null
) => {
    if (contract && signer) {
        const tx = await contract.connect(signer).capture(id, { value: value });
        console.log(tx);
    }
};

const HomePage = () => {
    const [signer, setSigner] = React.useState<ethers.providers.JsonRpcSigner | null>(null);
    const [address, setAddress] = React.useState<string>("");
    const [contract, setContract] = React.useState<ethers.Contract | null>(null);
    const [collection, setCollection] = React.useState<NFT[]>(createCollection());

    const inputRefs = Array.from(Array(COLLECTION_SIZE).keys()).map((id) => React.useRef<HTMLInputElement>(null));

    React.useEffect(() => {
        (async () => {
            let currentContract = contract;

            if (!currentContract) {
                const provider = new ethers.providers.Web3Provider((window as any).ethereum);
                currentContract = new ethers.Contract(CONTRACT, CONTRACT_ABI, provider);
                setContract(currentContract);
            }

            const updatedCollection = await updateCollection(collection, currentContract);
            console.log(updatedCollection);
            setCollection(updatedCollection);
        })();
    }, []);

    const connectWallet = async () => {
        const provider = new ethers.providers.Web3Provider((window as any).ethereum);

        try {
            await provider.send("eth_requestAccounts", []);

            if ((await provider.getNetwork()).name !== "rinkeby") {
                await (window as any).ethereum.request({
                    method: "wallet_switchEthereumChain",
                    params: [{ chainId: "0x4" }],
                });
            }

            const currentSigner = provider.getSigner();
            setSigner(currentSigner);
            setAddress(await currentSigner.getAddress());
        } catch (error) {
            console.log(error);
        }
    };

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
                {!signer && <button onClick={connectWallet}>Connect wallet</button>}

                {signer && (
                    <p>
                        Connected wallet: {address} (
                        <a
                            onClick={() => {
                                setSigner(null);
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
                        <img src={nft.image} alt={nft.name} />
                        <NFTButtonContainer>
                            {nft.lastPrice === 0 && (
                                <button onClick={async () => await mintToken(nft.id, signer, contract)}>Mint</button>
                            )}
                            {nft.lastPrice !== 0 && (
                                <>
                                    <input
                                        ref={inputRefs[nft.id - 1]}
                                        type="text"
                                        placeholder={`Min. price ${ethers.utils.formatEther(nft.lastPrice)} ETH`}
                                    />
                                    <button
                                        onClick={async () =>
                                            await captureToken(
                                                nft.id,
                                                parseFloat(inputRefs[nft.id - 1].current?.value || "") * 1e18,
                                                signer,
                                                contract
                                            )
                                        }
                                    >
                                        Capture
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
        </MainContainer>
    );
};

export default HomePage;
