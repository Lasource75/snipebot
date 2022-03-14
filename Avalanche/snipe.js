import Web3 from "../web3.js";

const web3 = Web3.web3;
const axios = Web3.axios;
// const fs = Web3.fs;

/**
 * @Dev : All useful addresses have to be here for more clarity.
 *
 */
const TRADER_JOE_ROUTER_ADDRESS = Web3.TRADER_JOE_ROUTER_ADDRESS;
const TRADER_JOE_FACTORY_ADDRESS = Web3.TRADER_JOE_FACTORY_ADDRESS;
const PANGOLIN_ROUTER_ADDRESS = Web3.PANGOLIN_ROUTER_ADDRESS;
const PANGOLIN_FACTORY_ADDRESS = Web3.PANGOLIN_FACTORY_ADDRESS;

/**
 * @Dev : Abi parsed
 */
const ABI_TRADER_JOE_ROUTER = Web3.ABI_TRADER_JOE_ROUTER;
const ABI_TRADER_JOE_FACTORY = Web3.ABI_TRADER_JOE_FACTORY;
const ABI_PANGOLIN_ROUTER = Web3.ABI_PANGOLIN_ROUTER;
const ABI_PANGOLIN_FACTORY = Web3.ABI_PANGOLIN_FACTORY;

/**
 * Contract are ready to use below
 */
let contract = Web3.TRADER_JOE_ROUTER_CONTRACT;
const joe_contract_factory = Web3.TRADER_JOE_FACTORY_CONTRACT;

const account = web3.eth.accounts.privateKeyToAccount(process.env.PRIVATE_KEY);

const block = await web3.eth.getBlock("latest");
let gas_limit = block.gasLimit / block.transactions.length;

const TOKEN_TO_SNIPE = process.env.TOKEN_TO_SNIPE;
const INPUT_TOKEN = process.env.INPUT_TOKEN;

const AMOUNT = process.env.AMOUNT;
const SLIPPAGE = process.env.SLIPPAGE;

let AVAX_PRICE = await Web3.getAvaxPrice();

//Prix de l'avax
AVAX_PRICE = AVAX_PRICE.data["avalanche-2"].usd;

// Adresse de la paire, c'est un smart contract qui contient la liquidité
const TOKEN_PAIR = await joe_contract_factory.methods
    .getPair(
        process.env.TOKEN_TO_SNIPE,
        "0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7"
    )
    .call({ from: account.address })
    .then((address) => {
        return address;
    });

const api_call_endpoint =
    "https://api.snowtrace.io/api?module=contract&action=getabi&address=" +
    TOKEN_PAIR +
    "&apikey=" +
    process.env.API_KEY;

// On récupère simplement l'ABI via l'API snowtrace
const tokenAbiNotParsed = await axios.get(api_call_endpoint);

let token_abi;
let token_contract;
try {
    // Parsing de l'abi qu'on à récuperé au préalable sur snowtrace via une requête API
    token_abi = JSON.parse(tokenAbiNotParsed.data.result);

    // Adresse du contract du token
    token_contract = new web3.eth.Contract(token_abi, TOKEN_PAIR);
} catch (e) {
    console.error(
        process.env.TOKEN_TO_SNIPE +
            " is not listed on this DEX, the bot will cancel the transaction"
    );
    process.exit(-1);
}

// Les reserves sont en wei (10^18)
const reserves = await token_contract.methods
    .getReserves()
    .call()
    .then((reserves) => {
        return reserves;
    });

// Calcul final du prix, il y a un bug ici, des fois il faut remplacer reserve0 par reserve et vice versa, je regarderai plus tard !
// TODO: Reparer le bug du prix
const token_price_finally =
    (Number(web3.utils.fromWei(reserves._reserve0)) * Number(AVAX_PRICE)) /
    Number(web3.utils.fromWei(reserves._reserve1));

// console.log(Number(web3.utils.fromWei(reserves._reserve1)));

console.log(
    `price of : ${process.env.TOKEN_TO_SNIPE} is $${token_price_finally} per token`
);

/*****************************************************************
 *****************************************************************
 *********************** MAIN METHODS ****************************
 *****************************************************************
 ****************************************************************/

//buyTraderJoe(TOKEN_TO_SNIPE, AMOUNT);

// approveTraderJoe(TOKEN_TO_SNIPE);

// let request = require('basic-request');
async function checkNotRug(address) {
    const body = await axios.get(
        "https://api.snowtrace.io/api?module=contract&action=getabi&address=" +
            address +
            "&apikey=" +
            process.env.API_KEY
    );
    return body.data;
}

async function getContractAbi(address) {
    const body = await axios.get(
        "https://api.snowtrace.io/api?module=contract&action=getabi&address=" +
            address +
            "&apikey=" +
            process.env.API_KEY
    );
    return body.data;
}

async function buyTraderJoe(addressToken, amount) {
    const isRug = await checkNotRug(addressToken);
    if (isRug.status == "1")
        throw "Potential rug detected, the order is canceled to avoid risks";
    try {
        const deadline_timestamp = Date.now() + 180000;

        let avaxToSwap = web3.utils.toWei(amount); // Conversion du montant en avax à acheter

        var swapExactAVAXForTokens = contract.methods.swapExactAVAXForTokens(
            web3.utils.toHex(1), // Montant minimum souhaité en sortie (lié au slippage)
            [INPUT_TOKEN, addressToken],
            account.address, // Adresse de notre wallet
            deadline_timestamp //timestamp
        );

        const swapTokenABI = await swapExactAVAXForTokens.encodeABI(); // Encodage des paramètre précédents.

        let SwapTokenTxn = {
            // Configuration de la transaction
            from: account.address, // Adresse de notre wallet
            to: TRADER_JOE_ROUTER_ADDRESS, // Adresse de trader joe
            value: avaxToSwap,
            gas: parseInt(gas_limit),
            data: swapTokenABI,
            type: "0x2",
        };

        let SignTxn = await web3.eth.accounts.signTransaction(
            SwapTokenTxn,
            account.privateKey
        );
        /*
        console.log("Signature txn : ");
        console.log(SignTxn);
        */
        let SendTxn = await web3.eth.sendSignedTransaction(
            SignTxn.rawTransaction,
            handleData
        );
        console.log("Envoi txn : " + SendTxn);
        console.log(SendTxn);
    } catch (error) {
        console.log(error);
    }
}

async function approveTraderJoe(addressToken) {
    /*
        const abi = await getContractAbi(addressToken);
    
        const parsed_abi = JSON.parse(abi.result)
    */
    contract = new web3.eth.Contract(abi_approve, addressToken);
    let amountMax =
        "115792089237316195423570985008687907853269984665640564039457584007913129639935";

    let approve = contract.methods.approve(
        TRADER_JOE_ROUTER_ADDRESS,
        amountMax
    );

    const approveAbi = approve.encodeABI();

    let approveTxn = {
        // Configuration de la transaction
        from: account.address, // Adresse de notre wallet
        to: TOKEN_TO_SNIPE, // Adresse de trader joe
        value: 0,
        gas: parseInt(gas_limit),
        data: approveAbi,
        type: "0x2",
    };
    /*
    web3.eth.accounts.signTransaction(approveTxn, account.privateKey).then(signed => {
        web3.eth.sendSignedTransaction(signed.rawTransaction.on('receipt', console.log))
    })
    */
    try {
        let signTxn = await web3.eth.accounts.signTransaction(
            approveTxn,
            account.privateKey
        );
        console.log(signTxn);

        let sendTxn = await web3.eth.sendSignedTransaction(
            signTxn.rawTransaction,
            handleData
        );
        console.log(sendTxn);
    } catch (err) {
        console.log(err);
    }
}

async function handleData(err, data) {
    if (err) {
        console.error(err);
    } else {
        console.log(data);
    }
}
