import Web3 from "../web3.js";
import fs from "fs";

const web3 = Web3.web3;
const axios = Web3.axios;

async function checkNotRug(data) {
    const body = await axios.get(
        "https://api.snowtrace.io/api?module=contract&action=getabi&address=" +
            data +
            "&apikey=" +
            process.env.API_KEY
    );
    // body response structure : {status : '1', message : 'OK', result : ''} where status == 1 mean the contract is verified
    return body.data;
}
// var startTime = performance.now();

let nonVerifiedContract = 0;
let verifiedContract = 0;
let contract;
const test = eazeaze;

fs.readFile("./logs/contracts_created.txt", "utf8", (err, data) => {
    if (err)
        throw "Can't find ./contracts_created.txt file in current directory";

    const splittedData = data.split("\n");
    const splittedDataLen = splittedData.length - 1;

    var i = 0;
    let contractAddress;

    const intervalEvent = setInterval(() => {
        if (i >= splittedDataLen) clearInterval(intervalEvent);

        contractAddress = splittedData[i].substring(47, 89);

        console.log(contractAddress);

        checkNotRug(contractAddress).then((jsonResponse) => {
            if (jsonResponse.status == "1") {
                // Le contract est vérifié
                contract = new web3.eth.Contract(
                    JSON.parse(jsonResponse.result)
                );
                //console.log(contract.methods);

                verifiedContract++;
                fs.appendFile(
                    "./logs/verified_contracts.txt",
                    "https://snowtrace.io/address/" + contractAddress + "\n",
                    (err) => {
                        if (err) {
                            console.log(
                                "could not write to ./logs/verified_contracts.txt"
                            );
                        }
                    }
                );
            } else {
                console.log("Not verified");
                nonVerifiedContract++;
            }
        });
        i++;
    }, 200);
});
