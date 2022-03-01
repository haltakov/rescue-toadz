import {
    Collection,
    Explanation,
    FAQ,
    MainContainer,
    NFT,
    NFTButtonContainer,
    QuestionsContainer,
} from "./HomePage.styles";

const COLLECTION_SIZE = 3;

type NFT = {
    id: number;
    name: string;
    image: string;
    link: string;
};

const createCollection = (): NFT[] => {
    return Array.from(Array(COLLECTION_SIZE).keys()).map((id) => ({
        id: id + 1,
        name: `Infinite Auction for Ukraine #${id + 1}`,
        image: `/nft/ukraine${id + 1}.jpg`,
        link: `https://opensea.io/assets/0x000000000000000000000000000/${id + 1}`,
    }));
};

const HomePage = () => {
    const collection = createCollection();

    console.log(collection);

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

            <Collection>
                {collection.map((nft) => (
                    <NFT key={nft.id}>
                        <h3>{nft.name}</h3>
                        <img src={nft.image} alt={nft.name} />
                        <NFTButtonContainer>
                            {nft.id == 3 && <button>Mint</button>}
                            {nft.id < 3 && (
                                <>
                                    <input type="text" placeholder="Min. price 0.10 ETH" />
                                    <button>Capture</button>
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
