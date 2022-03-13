import Web3 from "./web3.js";
import fetch from "node-fetch";
import fs from "fs";

let contract;

const web3 = Web3.web3;

async function checkNotRug(data) {
    const body = await fetch(
        "https://api.snowtrace.io/api?module=contract&action=getabi&address=" +
            data +
            "&apikey=" +
            process.env.API_KEY
    );
    return body.json();
}

checkNotRug("0x9BFF351eaF8d116BcA2F936559D60b8A7B482E43").then(
    (jsonResponse) => {
        if (jsonResponse["status"] == "1") {
            console.log("Contract is verified");
            const abiArray = JSON.parse(jsonResponse["result"]);
            contract = new web3.eth.Contract(
                abiArray,
                "0x9BFF351eaF8d116BcA2F936559D60b8A7B482E43"
            );
            /*
        contract.events.allEvents().on(
            "data", (data) => {
                console.log(data)
            }
        )
        */
            contract.events
                .Transfer({
                    filter: {
                        from: "0x8f0bd8c329caec85d646abcd8f201a83c4eb63a0",
                    },
                })
                .on("data", async (event) => {
                    //console.log("-------------------")
                    //console.log(event.returnValues)
                    console.log(
                        "Value : " +
                            web3.utils.fromWei(event.returnValues.value)
                    );
                    console.log("-------------------");
                });
        } else {
            console.log("get request returned " + jsonResponse["status"]);
        }
    }
);
