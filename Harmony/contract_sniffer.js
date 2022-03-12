//import Web3 from 'web3';
import fs from "fs";
import Web3 from "../web3.js";

const web3 = Web3.web3;
const axios = Web3.axios;

async function checkNotRug(data) {
    const body = await axios.get(
        "https://api.snowtrace.io/api?module=contract&action=getabi&address=" +
            data +
            "&apikey=" +
            process.env.API_KEY
    );
    return body.data;
}

const methodsId = {
    "0x38ed1739": "swapExactTokensForTokens",
};

let date;

function getCurrentTime() {
    date = new Date();
    return (
        "[" +
        date.getHours().toString() +
        ":" +
        date.getMinutes().toString() +
        ":" +
        date.getSeconds().toString() +
        "]"
    );
}

let blockNumber;

async function getBlock(blockNumber) {
    return await web3.eth.getBlock(blockNumber, true);
}

let methodId = "";
let contractAddress = "";

function contractCreated(transactionWithContractAddress) {
    // Permet de recuperer l'adresse du smart contract, que je mets ensuite en lowerCase car : https://community.metamask.io/t/address-correct-but-all-cap-letters-were-changed-to-lower-case/1521
    contractAddress =
        transactionWithContractAddress.contractAddress.toLowerCase();

    console.log(
        "Contract creation = https://snowtrace.io/address/" +
            contractAddress +
            "\n"
    );

    checkNotRug(contractAddress).then((jsonResponse) => {
        if (jsonResponse.status == "1") {
            // Le contract est vérifié
            fs.appendFile(
                "./logs/contracts_created.txt",
                "Contract creation:https://snowtrace.io/address/" +
                    contractAddress +
                    " : Verified at " +
                    getCurrentTime() +
                    "\n",
                (err) => {
                    if (err) {
                        console.log(
                            "could not write to ./logs/contracts_created.txt"
                        );
                    }
                }
            );
        } else {
            fs.appendFile(
                "./logs/contracts_created.txt",
                "Contract creation:https://snowtrace.io/address/" +
                    contractAddress +
                    " : Not verified  " +
                    getCurrentTime() +
                    "\n",
                (err) => {
                    if (err) {
                        console.log(
                            "could not write to ./logs/contracts_created.txt"
                        );
                    }
                }
            );
            //console.log("get request returned " + jsonResponse['status'])
        }
    });
}

var subscription = web3.eth
    .subscribe("newBlockHeaders", (err, succ) => {})
    .on("data", (block) => {
        blockNumber = block.number;
        getBlock(blockNumber).then((block) => {
            // console.log("\t\t\tBlock number : " + block.number);
            const transactionsArray = block.transactions;
            const transactionsArrayLen = block.transactions.length;
            const methodIdArray = [];

            /*
            console.log("=========== block number ===========")
            console.log("\t\t" + block.number);
            console.log("=========== transaction array size ===========")
            console.log("\t" + transactionsArrayLen);
            console.log("\tTransaction to : " + transactionsArray[0].to);
            */

            transactionsArray.forEach((transaction) => {
                methodId = transaction.input.substring(0, 10);
                contractAddress = transaction.input.substring(34, 74);
                switch (methodId) {
                    /*
                    case "0x38ed1739":
                        //console.log("\tswapExactTokensForTokens detected");
                        // methodId = "swapExactTokensForTokens";
                        // methodIdArray.push(methodId);
                        break;

                    case "0xa2a1623d":
                        // console.log("\tswapExactAVAXForTokens detected");
                        // methodId = "swapExactAVAXForTokens";
                        // methodIdArray.push(methodId);
                        break;
                    */
                    case "0x60806040": // marche aussi 0x6c01431e
                        web3.eth
                            .getTransactionReceipt(transaction.hash)
                            .then((transactionWithContractAddress) => {
                                contractCreated(transactionWithContractAddress);
                            });
                        break;

                    case "0x6c01431e": // marche aussi 0x6c01431e
                        console.log(
                            getCurrentTime() +
                                "\tblock number : " +
                                block.number
                        );

                        web3.eth
                            .getTransactionReceipt(transaction.hash)
                            .then((transactionWithContractAddress) => {
                                contractCreated(transactionWithContractAddress);
                            });

                        break;

                    case "0x60a06040": // marche aussi 0x6c01431e
                        console.log(
                            getCurrentTime() +
                                "\tblock number : " +
                                block.number
                        );
                        web3.eth
                            .getTransactionReceipt(transaction.hash)
                            .then((transactionWithContractAddress) => {
                                contractCreated(transactionWithContractAddress);
                            });
                        break;

                    case "0x715018a6":
                        console.log(
                            getCurrentTime() +
                                "\tBlock number : " +
                                block.number
                        );
                        console.log("\tRenounceOwnerShip detected");

                        fs.appendFile(
                            "ownership_renounced.txt",
                            getCurrentTime() +
                                " OwnerShipRenounced at block : " +
                                block.number +
                                "\n",
                            (err) => {
                                if (err) {
                                    console.log(
                                        "could not write to ownership_renounced.txt"
                                    );
                                }
                            }
                        );

                        break;
                    /*
                case "0xf91b3f72":
                    //console.log("\taddLiquidityAVAX detected");
                    //console.log(transaction)
                    console.log(getCurrentTime() + " Liquidity added to : https://snowtrace.io/token/0x" + contractAddress);
                    console.log("dexscreener = https://dexscreener.com/avalanche/0x" + contractAddress);
                    methodId = "addLiquidityAVAX";
                    amountInAvax = web3.utils.fromWei(transaction.value);
                    if (amountInAvax[0] == "0" && amountInAvax[1] == ".") {
                        amountInAvax = amountInAvax.substring(0.5)
                    } else {
                        amountInAvax = amountInAvax.substring(0, amountInAvax.indexOf("."))
                    }
                    // console.log("amount in AVAX : " + web3.utils.fromWei(transaction.value).substring(0, 4));
                    console.log("amount in AVAX(2) : " + amountInAvax);
                    methodIdArray.push(methodId);
                    break;
                    */
                    default:
                        "erreur";
                        break;
                }
            });
        });
        /*
        subscription.unsubscribe(
            (err, succ) => {
                if (succ) {
                    console.log("unsubscribed");
                }
            });
 
            */
    });
