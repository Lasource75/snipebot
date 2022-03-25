import utils from "../config/web3.js";
import Web3 from "../config/node_connection.js";
import contracts from "../Avalanche/preload_contracts.js";

const web3 = Web3.web3;
const axios = contracts.axios;
// const fs = Web3.fs;

const TRADER_JOE_ROUTER_ADDRESS = "0x60aE616a2155Ee3d9A68541Ba4544862310933d4";
const TRADER_JOE_FACTORY_ADDRESS = "0x9Ad6C38BE94206cA50bb0d90783181662f0Cfa10";

const PANGOLIN_ROUTER_ADDRESS = "0xE54Ca86531e17Ef3616d22Ca28b0D458b6C89106";
const PANGOLIN_FACTORY_ADDRESS = "0xefa94DE7a4656D787667C749f7E1223D71E9FD88";

const TRADER_JOE_ROUTER_CONTRACT = contracts.TRADER_JOE_ROUTER_CONTRACT;
const TRADER_JOE_FACTORY_CONTRACT = contracts.TRADER_JOE_FACTORY_CONTRACT;
const PANGOLIN_ROUTER_CONTRACT = contracts.PANGOLIN_ROUTER_CONTRACT;
const PANGOLIN_FACTORY_CONTRACT = contracts.PANGOLIN_FACTORY_CONTRACT;
const TOKEN_TO_SNIPE_CONTRACT = contracts.TOKEN_TO_SNIPE_CONTRACT;
const TOKEN_TO_SNIPE_PAIR = contracts.TOKEN_TO_SNIPE_PAIR;
const TOKEN_PAIR_CONTRACT = contracts.TOKEN_PAIR_CONTRACT;
const MOST_USED_TOKEN_FOR_PAIR = contracts.MOST_USED_TOKEN_FOR_PAIR;

const account = contracts.account;

const block = await web3.eth.getBlock("latest");
let gas_limit = block.gasLimit / block.transactions.length;

const TOKEN_DECIMAL = await TOKEN_TO_SNIPE_CONTRACT.methods
    .decimals()
    .call()
    .then((TOKEN_DECIMAL) => {
        return TOKEN_DECIMAL;
    });

const PRICE_PAIR = contracts.PRICE_PAIR;

const getValueOfWei = utils.getValueOfWei;

// Les reserves sont en wei (10^18)
const reserves = await TOKEN_PAIR_CONTRACT.methods
    .getReserves()
    .call()
    .then((reserves) => {
        // console.log(reserves);
        return reserves;
    });

const reserve0 = await TOKEN_PAIR_CONTRACT.methods
    .token0()
    .call()
    .then((reserve0) => {
        return reserve0;
    });

const reserve1 = await TOKEN_PAIR_CONTRACT.methods
    .token1()
    .call()
    .then((reserve1) => {
        return reserve1;
    });

let TOKEN_PRICE;

let i;

for (i = 0; i < MOST_USED_TOKEN_FOR_PAIR.length; i++) {
    if (MOST_USED_TOKEN_FOR_PAIR[i].address == reserve0) {
        TOKEN_PRICE =
            (getValueOfWei(
                reserves._reserve0,
                MOST_USED_TOKEN_FOR_PAIR[i].decimals
            ) *
                MOST_USED_TOKEN_FOR_PAIR[i].price) /
            getValueOfWei(reserves._reserve1, TOKEN_DECIMAL);
    } else if (MOST_USED_TOKEN_FOR_PAIR[i].address == reserve1) {
        TOKEN_PRICE =
            (getValueOfWei(
                reserves._reserve1,
                MOST_USED_TOKEN_FOR_PAIR[i].decimals
            ) *
                MOST_USED_TOKEN_FOR_PAIR[i].price) /
            getValueOfWei(reserves._reserve0, TOKEN_DECIMAL);
    }
}

console.log({ TOKEN_PRICE });

// console.log(Number(web3.utils.fromWei(reserves._reserve1)));
/*
console.log(
    `price of : ${process.env.TOKEN_TO_SNIPE} is $${token_price_finally} per token`
);
*/
/*****************************************************************
 *****************************************************************
 *********************** MAIN METHODS ****************************
 *****************************************************************
 ****************************************************************/

//buyTraderJoe(TOKEN_TO_SNIPE, AMOUNT);

// approveTraderJoe(TOKEN_TO_SNIPE);

// let request = require('basic-request');
async function checkNotRug(address) {
    console.log(process.env.TOKEN_TO_SNIPE);
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

// let amount = (TOKEN_PRICE * process.env.AMOUNT) / PRICE_PAIR + "";
let amount = TOKEN_PRICE * (process.env.AMOUNT / PRICE_PAIR) + "";

console.log("Amount in avax = : " + process.env.AMOUNT);

amount = amount.substring(0, 15);

console.log({ amount });

buyTraderJoe(process.env.TOKEN_TO_SNIPE, amount);

async function buyTraderJoe(addressToken, amount) {
    /*
    const isRug = await checkNotRug(addressToken);
    if (isRug.status == "1")
        throw "Potential rug detected, the order is canceled to avoid risks";
        */
    try {
        const deadline_timestamp = Date.now() + 180000;
        console.log(typeof amount);
        let avaxToSwap = web3.utils.toWei("0.0000000000001"); // Conversion du montant en avax à acheter
        console.log("ARETTTTTTTTTTTTTTTTTTTE");
        var swapExactAVAXForTokens =
            TRADER_JOE_ROUTER_CONTRACT.methods.swapExactAVAXForTokens(
                web3.utils.toHex(1), // Montant minimum souhaité en sortie (lié au slippage)
                [process.env.INPUT_TOKEN, addressToken], // Si la LP n'est pas INPUT_TOKEN/addressToken, on aura une erreur type : Object.TransactionRevertedWithoutReasonError
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
    let amountMax =
        "115792089237316195423570985008687907853269984665640564039457584007913129639935";

    let approve = TRADER_JOE_ROUTER_CONTRACT.methods.approve(
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
