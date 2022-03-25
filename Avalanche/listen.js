/* eslint-disable prettier/prettier */
import Web3 from "../config/web3.js";
import node_connection from "../config/node_connection.js";

let contract;

const web3 = Web3.web3;
const axios = Web3.axios;

const AppTag = "DashboardScreen";

async function checkNotRug(data) {
    const body = await axios.get(
        "https://api.snowtrace.io/api?module=contract&action=getabi&address=" +
            data +
            "&apikey=" +
            process.env.API_KEY
    );
    return body.data;
}

try {
    if (process.env.LISTEN_CONTRACT_ADDRESS == "") {
        throw "Please enter a value for LISTEN_CONTRACT_ADDRESS in the .env file";
    }

    checkNotRug(process.env.LISTEN_CONTRACT_ADDRESS).then((jsonResponse) => {
        if (jsonResponse.status == "1") {
            console.log("Contract is verified");
            const abiArray = JSON.parse(jsonResponse["result"]);
            contract = new web3.eth.Contract(
                abiArray,
                process.env.LISTEN_CONTRACT_ADDRESS
            );
            
            contract.events.allEvents().on("data", (data) => {
                console.log(data);
            });

            contract.events
                .Transfer({
                    filter: {
                        from: "0xBB8F2271FA9dB1f514Ce0f072d82A5daC80313ad",
                        to: "0xBB8F2271FA9dB1f514Ce0f072d82A5daC80313ad"
                    },
                })
                .on("data", (event) => {
                    //console.log("-------------------")
                    //console.log(event.returnValues)
                    if(event.from == "0x539d67e4b630c2a3302f9b5769d36cf18500b345"){
                        console.log("Bought of : " + web3.utils.fromWei(event.returnValues.value) + " tokens");
                    } else if (event.to == "0x539d67e4b630c2a3302f9b5769d36cf18500b345"){
                        console.log("Sell of : " + web3.utils.fromWei(event.returnValues.value) + " tokens");
                    }
                    console.log(
                        "Value : " +
                            web3.utils.fromWei(event.returnValues.value)
                    );
                        /*
                    console.log("-------------------");
                    appLogger(
                        AppTag,
                        "Value :",
                        web3.utils.fromWei(event.returnValues.value)
                    );
                    */
                });
        } else {
            console.log("get request returned " + jsonResponse["status"]);
        }
    });
} catch (e) {
    console.error(e);
    process.exit();
}
