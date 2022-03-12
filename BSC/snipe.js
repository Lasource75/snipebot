import Web3 from '../web3.js'

const web3 = Web3.web3;
const axios = Web3.axios;
const fs = Web3.fs;

/**
 * @Dev : All useful addresses have to be here for more clarity.
 * 
 */
const TRADER_JOE_ROUTER_ADDRESS = Web3.TRADER_JOE_ROUTER_ADDRESS;
const TRADER_JOE_FACTORY_ADDRESS = Web3.TRADER_JOE_FACTORY_ADDRESS;
const PANGOLIN_ROUTER_ADDRESS = Web3.PANGOLIN_ROUTER_ADDRESS
const PANGOLIN_FACTORY_ADDRESS = Web3.PANGOLIN_FACTORY_ADDRESS;

/**
 * @Dev : Abi parsed
 */

const ABI_TRADER_JOE_ROUTER = Web3.ABI_TRADER_JOE_ROUTER
const ABI_TRADER_JOE_FACTORY = Web3.ABI_TRADER_JOE_FACTORY
const ABI_PANGOLIN_ROUTER = Web3.ABI_PANGOLIN_ROUTER
const ABI_PANGOLIN_FACTORY = Web3.ABI_PANGOLIN_FACTORY

let contract = Web3.TRADER_JOE_ROUTER_CONTRACT

const account = web3.eth.accounts.privateKeyToAccount(process.env.PRIVATE_KEY);

const block = await web3.eth.getBlock("latest");
let gas_limit = block.gasLimit / block.transactions.length


const TOKEN_TO_SNIPE = process.env.TOKEN_TO_SNIPE;
const INPUT_TOKEN = process.env.INPUT_TOKEN;
const AMOUNT = process.env.AMOUNT;
const SLIPPAGE = process.env.SLIPPAGE;


const TOKEN_PAIR = 0;

const TOKEN_PRICE = 0;

/*****************************************************************
 *****************************************************************
 *********************** MAIN METHODS ****************************
 *****************************************************************
 ****************************************************************/

buyTraderJoe(TOKEN_TO_SNIPE, AMOUNT);

// approveTraderJoe(TOKEN_TO_SNIPE);

// let request = require('basic-request');
async function checkNotRug(address) {
    const body = await axios.get('https://api.snowtrace.io/api?module=contract&action=getabi&address=' + address + '&apikey=' + process.env.API_KEY);
    return body.data;
}

async function getContractAbi(address) {
    const body = await axios.get('https://api.snowtrace.io/api?module=contract&action=getabi&address=' + address + '&apikey=' + process.env.API_KEY);
    return body.data;
}

async function buyTraderJoe(addressToken, amount) {
    const isRug = await checkNotRug(addressToken);
    if (isRug.status == '1')
        throw "Potential rug detected, the order is canceled to avoid risks";
    try {
        const deadline_timestamp = (Date.now() + 180000);

        let avaxToSwap = web3.utils.toWei(amount); // Conversion du montant en avax à acheter

        var swapExactAVAXForTokens = contract.methods.swapExactAVAXForTokens(
            web3.utils.toHex(1), // Montant minimum souhaité en sortie (lié au slippage)
            [INPUT_TOKEN, addressToken],
            account.address, // Adresse de notre wallet
            deadline_timestamp //timestamp
        );

        const swapTokenABI = await swapExactAVAXForTokens.encodeABI(); // Encodage des paramètre précédents.

        let SwapTokenTxn = { // Configuration de la transaction
            from: account.address, // Adresse de notre wallet
            to: TRADER_JOE_ROUTER_ADDRESS, // Adresse de trader joe
            value: avaxToSwap,
            gas: parseInt(gas_limit),
            data: swapTokenABI,
            type: "0x2",
        };

        let SignTxn = await web3.eth.accounts.signTransaction(SwapTokenTxn, account.privateKey);
        console.log("Signature txn : ");
        console.log(SignTxn);

        let SendTxn = await web3.eth.sendSignedTransaction(SignTxn.rawTransaction, handleData);
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
    let contract = new web3.eth.Contract(abi_approve, addressToken);
    let amountMax = "115792089237316195423570985008687907853269984665640564039457584007913129639935";

    let approve = contract.methods.approve(
        TRADER_JOE_ROUTER_ADDRESS, amountMax
    );

    const approveAbi = approve.encodeABI();

    let approveTxn = { // Configuration de la transaction
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
        let signTxn = await web3.eth.accounts.signTransaction(approveTxn, account.privateKey);
        console.log(signTxn);

        let sendTxn = await web3.eth.sendSignedTransaction(signTxn.rawTransaction, handleData);
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
