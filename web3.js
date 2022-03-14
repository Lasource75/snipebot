import Web3 from "web3";
import dotenv from "dotenv";
import axios from "axios";
import fs from "fs";
import CoinGecko from "coingecko-api";

// Initialisation obligatoire ! Voir plus : https://www.npmjs.com/package/dotenv
dotenv.config();
const CoinGeckoClient = new CoinGecko();

// Option pour maintenir la connection au node si coupure il y a.
const options = {
    timeout: 30000, //ms

    clientConfig: {
        maxReceivedFrameSize: 100000000,
        maxReceivedMessageSize: 100000000,

        keepalive: true,
        keepaliveInterval: -1,
    },

    reconnect: {
        auto: true,
        delay: 1000,
        maxAttemps: 10000,
        onTimeout: true,
    },
};

// Initialisation avec les options
const web3 = new Web3(options);

if (process.env.PROD == "true") {
    console.log(process.env.PROD);
    web3.setProvider(new Web3.providers.WebsocketProvider(process.env.TESTNET));
    console.log("Currently on : Testnet \n");
} else {
    web3.setProvider(new Web3.providers.WebsocketProvider(process.env.BC_URL));
    console.log("Currently on : Mainnet \n");
}

const account = web3.eth.accounts.privateKeyToAccount(process.env.PRIVATE_KEY);

/**
 *
 * Initialisation des ABI pour éviter d'avoir à les récuperer à chaque fois
 */

let rawData;

// TRADER JOE ROUTER
rawData = fs.readFileSync("./abi/trader_joe_router.json");
const ABI_TRADER_JOE_ROUTER = JSON.parse(rawData);

// TRADER JOE FACTORY
rawData = fs.readFileSync("./abi/trader_joe_factory.json");
const ABI_TRADER_JOE_FACTORY = JSON.parse(rawData);

// PANGOLIN ROUTER
rawData = fs.readFileSync("./abi/pangolin_router.json");
const ABI_PANGOLIN_ROUTER = JSON.parse(rawData);

// PANGOLIN FACTORY
rawData = fs.readFileSync("./abi/pangolin_factory.json");
const ABI_PANGOLIN_FACTORY = JSON.parse(rawData);

// ABI APPROVE
rawData = fs.readFileSync("./abi/abi_approve.json");
const ABI_APPROVE = JSON.parse(rawData);

/**
 * Token addresses
 */
const MIM = "0x130966628846BFd36ff31a822705796e8cb8C18D"; // MIM
const AVAX = "0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7"; // AVAX
const USDC = "0xb97ef9ef8734c71904d8002f8b6bc66dd9c48a6e"; // USDC

/**
 * DEX Contracts
 *
 */
const TRADER_JOE_ROUTER_ADDRESS = "0x60aE616a2155Ee3d9A68541Ba4544862310933d4";
const TRADER_JOE_FACTORY_ADDRESS = "0x9Ad6C38BE94206cA50bb0d90783181662f0Cfa10";

const PANGOLIN_ROUTER_ADDRESS = "0xE54Ca86531e17Ef3616d22Ca28b0D458b6C89106";
const PANGOLIN_FACTORY_ADDRESS = "0xefa94DE7a4656D787667C749f7E1223D71E9FD88";

/**
 * DEX ABI
 */
const TRADER_JOE_ROUTER_CONTRACT = new web3.eth.Contract(
    ABI_TRADER_JOE_ROUTER,
    TRADER_JOE_ROUTER_ADDRESS,
    { from: account.address }
);

const TRADER_JOE_FACTORY_CONTRACT = new web3.eth.Contract(
    ABI_TRADER_JOE_FACTORY,
    TRADER_JOE_FACTORY_ADDRESS,
    { from: account.address }
);

const PANGOLIN_ROUTER_CONTRACT = new web3.eth.Contract(
    ABI_PANGOLIN_ROUTER,
    PANGOLIN_ROUTER_ADDRESS,
    { from: account.address }
);
const PANGOLIN_FACTORY_CONTRACT = new web3.eth.Contract(
    ABI_PANGOLIN_FACTORY,
    PANGOLIN_FACTORY_ADDRESS,
    { from: account.address }
);

async function getAvaxPrice() {
    return CoinGeckoClient.simple.price({
        ids: ["avalanche-2"],
        vs_currencies: ["usd"],
    });
}

export default {
    web3,
    MIM,
    AVAX,
    USDC,
    axios,
    fs,
    TRADER_JOE_ROUTER_ADDRESS,
    TRADER_JOE_FACTORY_ADDRESS,
    PANGOLIN_ROUTER_ADDRESS,
    PANGOLIN_FACTORY_ADDRESS,
    ABI_TRADER_JOE_ROUTER,
    ABI_TRADER_JOE_FACTORY,
    ABI_PANGOLIN_ROUTER,
    ABI_PANGOLIN_FACTORY,
    ABI_APPROVE,
    TRADER_JOE_ROUTER_CONTRACT,
    TRADER_JOE_FACTORY_CONTRACT,
    PANGOLIN_ROUTER_CONTRACT,
    PANGOLIN_FACTORY_CONTRACT,
    account,
    getAvaxPrice,
};
