import Web3 from "web3";
import dotenv from "dotenv";
import axios from "axios";
import fs from "fs";
import CoinGecko from "coingecko-api";
import path from "path";

// Token address
const MIM = "0x130966628846BFd36ff31a822705796e8cb8C18D"; // MIM
const AVAX = "0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7"; // AVAX
const USDC = "0xb97ef9ef8734c71904d8002f8b6bc66dd9c48a6e"; // USDC

const TOKENS_ARR = [AVAX, USDC, MIM];

// DEX contracts address
const TRADER_JOE_ROUTER_ADDRESS = "0x60aE616a2155Ee3d9A68541Ba4544862310933d4";
const TRADER_JOE_FACTORY_ADDRESS = "0x9Ad6C38BE94206cA50bb0d90783181662f0Cfa10";

const PANGOLIN_ROUTER_ADDRESS = "0xE54Ca86531e17Ef3616d22Ca28b0D458b6C89106";
const PANGOLIN_FACTORY_ADDRESS = "0xefa94DE7a4656D787667C749f7E1223D71E9FD88";

// All json data will be writed to this this var
let rawData;

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

// Initialisation obligatoire ! Voir plus : https://www.npmjs.com/package/dotenv
dotenv.config();
const CoinGeckoClient = new CoinGecko();

const TOKEN_ABI_URL =
    "https://api.snowtrace.io/api?module=contract&action=getabi&address=" +
    process.env.TOKEN_TO_SNIPE +
    "&apikey=" +
    process.env.API_KEY;

// Account who will send transactions
const account = web3.eth.accounts.privateKeyToAccount(process.env.PRIVATE_KEY);

if (process.env.PROD == "true") {
    console.log(process.env.PROD);
    web3.setProvider(new Web3.providers.WebsocketProvider(process.env.TESTNET));
    console.log("Currently on : Testnet \n");
} else {
    web3.setProvider(new Web3.providers.WebsocketProvider(process.env.BC_URL));
    console.log("Currently on : Mainnet \n");
}

// TRADER JOE ROUTER
rawData = fs.readFileSync(
    path.relative("./web3.js", "./Avalanche/abi/trader_joe_router.json")
);
const ABI_TRADER_JOE_ROUTER = JSON.parse(rawData);

// TRADER JOE FACTORY
rawData = fs.readFileSync(
    path.relative("./web3.js", "./Avalanche/abi/trader_joe_factory.json")
);
const ABI_TRADER_JOE_FACTORY = JSON.parse(rawData);

// PANGOLIN ROUTER
rawData = fs.readFileSync(
    path.relative(".//web3.js", "./Avalanche/abi/pangolin_router.json")
);
const ABI_PANGOLIN_ROUTER = JSON.parse(rawData);

// PANGOLIN FACTORY
rawData = fs.readFileSync(
    path.relative("./web3.js", "./Avalanche/abi/pangolin_factory.json")
);
const ABI_PANGOLIN_FACTORY = JSON.parse(rawData);

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

// Adresse de la paire, c'est le smart contract qui contient la liquidité
const TOKEN_TO_SNIPE_PAIR = await TRADER_JOE_FACTORY_CONTRACT.methods
    .getPair(
        process.env.TOKEN_TO_SNIPE,
        "0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7"
    )
    .call({ from: account.address })
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

const TOKEN_TO_SNIPE_SYMBOL = await TOKEN_TO_SNIPE_CONTRACT.methods
    .symbol()
    .call()
    .then((symbol) => {
        return symbol;
    });

const TOKEN_TO_SNIPE_DECIMALS = await TOKEN_TO_SNIPE_CONTRACT.methods
    .decimals()
    .call()
    .then((decimals) => {
        return decimals;
    });

const TOKEN_TO_SNIPE_PAIR_RESERVE0 = await TOKEN_PAIR_CONTRACT.methods
    .token0()
    .call()
    .then((token0) => {
        return token0;
    });

const TOKEN_TO_SNIPE_PAIR_RESERVE1 = await TOKEN_PAIR_CONTRACT.methods
    .token1()
    .call()
    .then((token1) => {
        return token1;
    });

const TOKEN_TO_SNIPE_PAIR_RESERVE0_URL =
    "https://api.snowtrace.io/api?module=contract&action=getabi&address=" +
    TOKEN_TO_SNIPE_PAIR_RESERVE1 +
    "&apikey=" +
    process.env.API_KEY;

const TOKEN_TO_SNIPE_PAIR_RESERVE1_URL =
    "https://api.snowtrace.io/api?module=contract&action=getabi&address=" +
    TOKEN_TO_SNIPE_PAIR_RESERVE1 +
    "&apikey=" +
    process.env.API_KEY;

const TOKEN_TO_SNIPE_PAIR_RESERVE0_ABI = await axios.get(
    TOKEN_TO_SNIPE_PAIR_RESERVE0_URL
);

const TOKEN_TO_SNIPE_PAIR_RESERVE1_ABI = await axios.get(
    TOKEN_TO_SNIPE_PAIR_RESERVE1_URL
);

const TOKEN_TO_SNIPE_PAIR_RESERVE0_CONTRACT = new web3.eth.Contract(
    JSON.parse(TOKEN_TO_SNIPE_PAIR_RESERVE0_ABI.data.result),
    TOKEN_TO_SNIPE_PAIR_RESERVE0
);
const TOKEN_TO_SNIPE_PAIR_RESERVE1_CONTRACT = new web3.eth.Contract(
    JSON.parse(TOKEN_TO_SNIPE_PAIR_RESERVE1_ABI.data.result),
    TOKEN_TO_SNIPE_PAIR_RESERVE1
);

const TOKEN_TO_SNIPE_RESERVE0_SYMBOL =
    await TOKEN_TO_SNIPE_PAIR_RESERVE0_CONTRACT.methods
        .symbol()
        .call()
        .then((symbol) => {
            return symbol;
        });
const TOKEN_TO_SNIPE_RESERVE0_DECIMALS =
    await TOKEN_TO_SNIPE_PAIR_RESERVE0_CONTRACT.methods
        .decimals()
        .call()
        .then((decimals) => {
            return decimals;
        });

const TOKEN_TO_SNIPE_RESERVE1_SYMBOL =
    await TOKEN_TO_SNIPE_PAIR_RESERVE1_CONTRACT.methods
        .symbol()
        .call()
        .then((symbol) => {
            return symbol;
        });

const TOKEN_TO_SNIPE_RESERVE1_DECIMALS =
    await TOKEN_TO_SNIPE_PAIR_RESERVE1_CONTRACT.methods
        .decimals()
        .call()
        .then((decimals) => {
            return decimals;
        });

let TOKEN_TO_DIVIDE;

let i;
for (i = 0; i < TOKENS_ARR.length; i++) {
    console.log(TOKENS_ARR[i] + " : " + TOKEN_TO_SNIPE_PAIR_RESERVE0);
    if (TOKENS_ARR[i] == TOKEN_TO_SNIPE_PAIR_RESERVE1) {
        TOKEN_TO_DIVIDE = TOKENS_ARR[i];
        break;
    }
}

console.log(TOKEN_TO_DIVIDE);

async function getAvaxPrice() {
    return CoinGeckoClient.simple.price({
        ids: ["avalanche-2"],
        vs_currencies: ["usd"],
    });
}

/**
 * Token informations
 */
// Quand j'enlève le await et que je console log plus bas j'ai un affichage chelou Fab si tu lis ça aide moiii

const block = await web3.eth.getBlock("latest");
let gas_limit = block.gasLimit / block.transactions.length;

const TOKEN_TO_SNIPE = process.env.TOKEN_TO_SNIPE;
const INPUT_TOKEN = process.env.INPUT_TOKEN;

const AMOUNT = process.env.AMOUNT;
const SLIPPAGE = process.env.SLIPPAGE;

let AVAX_PRICE = await getAvaxPrice();

//Prix de l'avax
AVAX_PRICE = AVAX_PRICE.data["avalanche-2"].usd;

/**
 * @Dev Token pair contract start here please put your code below
 */
// Les reserves sont en wei (10^18)
const reserves = await TOKEN_PAIR_CONTRACT.methods
    .getReserves()
    .call()
    .then((reserves) => {
        return reserves;
    });

//Les cas à traiter sont les valeurs pour lesquels unit = 4,5,7,8,10,11,13,14,16 ou 17
function getFormatOfReserve(tokenReserve, unit) {
    // 3,6,9,12,15,18
    console.log("Token reserve : " + tokenReserve + "\nUnit : " + unit + "\n");
    switch (unit) {
        case 3:
            return web3.fromWei(tokenReserve, "babbage");
        case 6:
            return web3.fromWei(tokenReserve, "lovelace");
        case 9:
            return web3.fromWei(tokenReserve, "shanon");
        case 12:
            return web3.fromWei(tokenReserve, "szabo");
        case 15:
            return web3.fromWei(tokenReserve, "finney");
        case 18:
            return web3.fromWei(tokenReserve, "ether");
        default:
            break;
    }
    // Attention, peux poser des soucis avec un tokenReserve assez grand.
    return tokenReserve / 10 ** unit;
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
    // ABI_APPROVE,
    TRADER_JOE_ROUTER_CONTRACT,
    TRADER_JOE_FACTORY_CONTRACT,
    PANGOLIN_ROUTER_CONTRACT,
    PANGOLIN_FACTORY_CONTRACT,
    account,
    getAvaxPrice,
    TOKEN_TO_SNIPE_CONTRACT,
    getFormatOfReserve,
};
