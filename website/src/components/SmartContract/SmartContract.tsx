import React from "react";
import { BigNumber, Contract, Signer, ethers } from "ethers";

import CONTRACT_ABI from "../contract_abi.json";

export const CONTRACT = "0x1Fce02c44E51843a142B9a0d909FEe6c43E70549";

export interface ContractHandler {
    hasSigner: () => boolean;
    connectWallet: () => Promise<string>;
    disconnectWallet: () => void;
    lastPrice: (id: number) => Promise<BigNumber>;
    owner: (id: number) => Promise<string>;
    mintToken: (id: number) => Promise<boolean>;
    captureToken: (id: number, value: BigNumber) => Promise<boolean>;
}

export const useContractHandler = (): ContractHandler => {
    return React.useMemo(() => {
        const provider = new ethers.providers.Web3Provider((window as any).ethereum);
        const contract = new Contract(CONTRACT, CONTRACT_ABI, provider);
        let signer: Signer | undefined = undefined;

        const connectWallet = async () => {
            try {
                await provider.send("eth_requestAccounts", []);

                if ((await provider.getNetwork()).name !== "rinkeby") {
                    await (window as any).ethereum.request({
                        method: "wallet_switchEthereumChain",
                        params: [{ chainId: "0x4" }],
                    });
                }

                signer = provider.getSigner();

                return await signer.getAddress();
            } catch (error) {
                console.log(error);
                return "";
            }
        };

        return {
            hasSigner: () => signer !== undefined,

            disconnectWallet: () => {
                signer = undefined;
            },

            connectWallet: connectWallet,

            lastPrice: async (id) => {
                if (!contract) return BigNumber.from(0);

                return await contract.lastPrice(id);
            },

            owner: async (id: number) => {
                return await contract.owner(id);
            },

            mintToken: async (id) => {
                if (!contract) return false;

                if (!signer) await connectWallet();

                if (signer) {
                    try {
                        const tx = await contract.connect(signer).mint(id, { value: await contract.MINT_PRICE() });
                        const receipt = await tx.wait();

                        return receipt.status === 1;
                    } catch (error) {
                        console.log(error);
                        return false;
                    }
                }

                return false;
            },

            captureToken: async (id, value) => {
                if (!contract) return false;

                if (!signer) await connectWallet();

                if (signer) {
                    try {
                        if (contract && signer) {
                            const tx = await contract.connect(signer).capture(id, { value: value });
                            const receipt = await tx.wait();

                            return receipt.status === 1;
                        }
                    } catch (error) {
                        console.log(error);
                        return false;
                    }
                } else return false;

                return false;
            },
        };
    }, []);
};
