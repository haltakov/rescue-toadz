import React from "react";
import { BigNumber, Contract, Signer, ethers } from "ethers";

import CONTRACT_ABI from "./contract_abi.json";

export const CONTRACT_ADDRESS = process.env.REACT_APP_CONTRACT_ADDRESS || "0x3a926b0d5850EAC6ba3fE918cEc810d3bE8A984B";
export const CONTRAT_NETWORK_ID = process.env.REACT_APP_SMART_CONTRACT_NETWORK_ID || "0x4";
export const COLLECTION_SIZE = parseInt(process.env.REACT_APP_COLLECTION_SIZE || "18");

export enum ContractError {
    None,
    NotEnoughBalance,
    NotMatchedDonation,
    Other,
}

export interface ContractHandler {
    getProvider: () => ethers.providers.Provider | undefined;
    hasSigner: () => boolean;
    getAddress: () => Promise<string>;
    connectWallet: () => Promise<string>;
    disconnectWallet: () => void;
    lastPrice: (id: number) => Promise<BigNumber>;
    owner: (id: number) => Promise<string>;
    mintToken: (id: number) => Promise<ContractError>;
    captureToken: (id: number, value: BigNumber) => Promise<ContractError>;
}

export const useContractHandler = (): ContractHandler => {
    return React.useMemo(() => {
        let provider: ethers.providers.Web3Provider | undefined = undefined;
        let contract: Contract | undefined = undefined;
        let signer: Signer | undefined = undefined;

        if ((window as any).ethereum) {
            provider = new ethers.providers.Web3Provider((window as any).ethereum);
            contract = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
        }

        return {
            getProvider: () => provider,

            hasSigner: () => signer !== undefined,

            getAddress: async () => (signer ? await signer.getAddress() : ""),

            disconnectWallet: () => {
                signer = undefined;
            },

            connectWallet: async () => {
                if (!provider) return "";

                try {
                    await provider.send("eth_requestAccounts", []);

                    if ((window as any).ethereum.chainId !== CONTRAT_NETWORK_ID) {
                        await (window as any).ethereum.request({
                            method: "wallet_switchEthereumChain",
                            params: [{ chainId: CONTRAT_NETWORK_ID }],
                        });

                        provider = new ethers.providers.Web3Provider((window as any).ethereum);
                        contract = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
                    }

                    signer = provider.getSigner();

                    return await signer.getAddress();
                } catch (error) {
                    console.log(error);
                    return "";
                }
            },

            lastPrice: async (id) => {
                if (!contract) return BigNumber.from(0);

                return await contract.lastPrice(id);
            },

            owner: async (id: number) => {
                if (!contract) return ethers.constants.AddressZero;

                return await contract.ownerOf(id);
            },

            mintToken: async (id) => {
                if (!contract) return ContractError.Other;

                if (signer) {
                    try {
                        const mintProce = await contract.MINT_PRICE();

                        if ((await signer.getBalance()).lt(mintProce)) return ContractError.NotEnoughBalance;

                        const tx = await contract.connect(signer).mint(id, { value: mintProce });
                        const receipt = await tx.wait();

                        return receipt.status === 1 ? ContractError.None : ContractError.Other;
                    } catch (error) {
                        console.log(error);
                        return ContractError.Other;
                    }
                }

                return ContractError.Other;
            },

            captureToken: async (id, value) => {
                if (!contract) return ContractError.Other;

                if (signer) {
                    try {
                        if (contract && signer) {
                            if ((await signer.getBalance()).lt(value)) return ContractError.NotEnoughBalance;

                            if (value < (await contract.lastPrice(id))) return ContractError.NotMatchedDonation;

                            const tx = await contract.connect(signer).capture(id, { value: value });
                            const receipt = await tx.wait();

                            return receipt.status === 1 ? ContractError.None : ContractError.Other;
                        }
                    } catch (error) {
                        console.log(error);
                        return ContractError.Other;
                    }
                } else return ContractError.Other;

                return ContractError.Other;
            },
        };
    }, []);
};
