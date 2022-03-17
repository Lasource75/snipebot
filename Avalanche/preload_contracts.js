import axios from "axios";
import fs from "fs";
import path from "path";
import Web3 from "../config/node_connection.js";
import CoinGecko from "coingecko-api";

const CoinGeckoClient = new CoinGecko();
const web3 = Web3.web3;

// DEX contracts address
const TRADER_JOE_ROUTER_ADDRESS = "0x60aE616a2155Ee3d9A68541Ba4544862310933d4";
const TRADER_JOE_FACTORY_ADDRESS = "0x9Ad6C38BE94206cA50bb0d90783181662f0Cfa10";

const PANGOLIN_ROUTER_ADDRESS = "0xE54Ca86531e17Ef3616d22Ca28b0D458b6C89106";
const PANGOLIN_FACTORY_ADDRESS = "0xefa94DE7a4656D787667C749f7E1223D71E9FD88";

// All json data will be writed to this this var
let rawData;

const TOKEN_ABI_URL =
    "https://api.snowtrace.io/api?module=contract&action=getabi&address=" +
    process.env.TOKEN_TO_SNIPE +
    "&apikey=" +
    process.env.API_KEY;

// Account who will send transactions
const account = web3.eth.accounts.privateKeyToAccount(process.env.PRIVATE_KEY);

/***********************************************************************************************************************************/
// TRADER JOE ROUTER
rawData = fs.readFileSync("abi/trader_joe_router.json");
const ABI_TRADER_JOE_ROUTER = JSON.parse(rawData);

// TRADER JOE FACTORY
rawData = fs.readFileSync("abi/trader_joe_factory.json");
const ABI_TRADER_JOE_FACTORY = JSON.parse(rawData);

// PANGOLIN ROUTER
rawData = fs.readFileSync("abi/pangolin_router.json");
const ABI_PANGOLIN_ROUTER = JSON.parse(rawData);

// PANGOLIN FACTORY
rawData = fs.readFileSync("abi/pangolin_factory.json");
const ABI_PANGOLIN_FACTORY = JSON.parse(rawData);

/***********************************************************************************************************************************/

/***********************************************************************************************************************************/
// DEX ABI
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
/***********************************************************************************************************************************/

/***********************************************************************************************************************************/
// Adresse de la paire, c'est le smart contract qui contient la liquidité

const TOKEN_TO_SNIPE_PAIR = await TRADER_JOE_FACTORY_CONTRACT.methods
    .getPair(
        process.env.TOKEN_TO_SNIPE,
        "0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7"
    )
    .call()
    .then((address) => {
        return address;
    });

const TOKEN_PAIR_ABI_URL =
    "https://api.snowtrace.io/api?module=contract&action=getabi&address=" +
    TOKEN_TO_SNIPE_PAIR +
    "&apikey=" +
    process.env.API_KEY;

const TOKEN_PAIR_ABI = await axios.get(TOKEN_PAIR_ABI_URL);

const TOKEN_TO_SNIPE_ABI = await axios.get(TOKEN_ABI_URL);
const TOKEN_TO_SNIPE_ABI_PARSED = JSON.parse(TOKEN_TO_SNIPE_ABI.data.result);

let TOKEN_PAIR_ABI_PARSED;
let TOKEN_PAIR_CONTRACT;
try {
    // Parsing de l'abi qu'on à récuperé au préalable sur snowtrace via une requête API
    TOKEN_PAIR_ABI_PARSED = JSON.parse(TOKEN_PAIR_ABI.data.result);

    // Adresse du contract du token
    TOKEN_PAIR_CONTRACT = new web3.eth.Contract(
        TOKEN_PAIR_ABI_PARSED,
        TOKEN_TO_SNIPE_PAIR
    );
} catch (e) {
    console.error(
        process.env.TOKEN_TO_SNIPE +
            " is not listed on this DEX, the bot will cancel the transaction"
    );
    process.exit(-1);
}

const TOKEN_TO_SNIPE_CONTRACT = new web3.eth.Contract(
    TOKEN_TO_SNIPE_ABI_PARSED,
    process.env.TOKEN_TO_SNIPE
);

/***********************************************************************************************************************************/

async function getAvaxPrice() {
    return CoinGeckoClient.simple.price({
        ids: ["avalanche-2"],
        vs_currencies: ["usd"],
    });
}

let AVAX_PRICE = await getAvaxPrice();

//Prix de l'avax
AVAX_PRICE = AVAX_PRICE.data["avalanche-2"].usd;

const MOST_USED_TOKEN_FOR_PAIR = [
    {
        address: "0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7",
        symbol: "WAVAX",
        decimals: 18,
        price: AVAX_PRICE,
    },
    {
        address: "0x130966628846BFd36ff31a822705796e8cb8C18D",
        symbol: "MIM",
        decimals: 18,
        price: 1,
    },
    {
        address: "0xb97ef9ef8734c71904d8002f8b6bc66dd9c48a6e",
        symbol: "USDC",
        decimals: 6,
        price: 1,
    },
    {
        address: "0xA7D7079b0FEaD91F3e65f86E8915Cb59c1a4C664",
        symbol: "USDC.e",
        decimals: 6,
        price: 1,
    },
    {
        address: "0xd586E7F844cEa2F87f50152665BCbc2C279D8d70",
        symbol: "DAI.e",
        decimals: 18,
        price: 1,
    },
];

export default {
    TRADER_JOE_ROUTER_CONTRACT,
    TRADER_JOE_FACTORY_CONTRACT,
    PANGOLIN_ROUTER_CONTRACT,
    PANGOLIN_FACTORY_CONTRACT,
    TOKEN_TO_SNIPE_PAIR,
    TOKEN_TO_SNIPE_CONTRACT,
    TOKEN_PAIR_CONTRACT,
    MOST_USED_TOKEN_FOR_PAIR,
    web3,
    account,
    AVAX_PRICE,
    getAvaxPrice,
};
