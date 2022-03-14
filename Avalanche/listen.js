import Web3 from "../web3.js";

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
/*
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
                "0x9BFF351eaF8d116BcA2F936559D60b8A7B482E43"
            );
            
            contract.events.allEvents().on(
                "data", (data) => {
                    console.log(data)
                }
                )
                
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
                    appLogger(
                        AppTag,
                        "Value :",
                        web3.utils.fromWei(event.returnValues.value)
                    );
                });
        } else {
            console.log("get request returned " + jsonResponse["status"]);
        }
    });
} catch (e) {
    console.error(e);
    process.exit();
}
*/
