require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-etherscan");
require("hardhat-gas-reporter");
require("solidity-coverage");
require("dotenv").config();

const RINKEBY_API_URL = process.env.RINKEBY_API_URL || "";
const RINKEBY_ETHERSCAN_KEY = process.env.RINKEBY_ETHERSCAN_KEY || "";
const RINKEBY_PRIVATE_KEY =
    process.env.RINKEBY_PRIVATE_KEY || "0000000000000000000000000000000000000000000000000000000000000000";
const MAINNET_API_URL = process.env.MAINNET_API_URL || "";
const MAINNET_ETHERSCAN_KEY = process.env.MAINNET_ETHERSCAN_KEY || "";
const MAINNET_PRIVATE_KEY =
    process.env.MAINNET_PRIVATE_KEY || "0000000000000000000000000000000000000000000000000000000000000000";

module.exports = {
    solidity: "0.8.12",
    networks: {
        hardhat: {},
        mainnet: {
            url: MAINNET_API_URL,
            accounts: [`0x${MAINNET_PRIVATE_KEY}`],
        },
        rinkeby: {
            url: RINKEBY_API_URL,
            accounts: [`0x${RINKEBY_PRIVATE_KEY}`],
        },
    },
    etherscan: {
        apiKey: MAINNET_ETHERSCAN_KEY,
    },
    gasReporter: {
        enabled: process.env.REPORT_GAS ? true : false,
    },
};
