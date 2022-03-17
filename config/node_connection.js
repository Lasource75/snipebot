import Web3 from "web3";
import dotenv from "dotenv";

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

// Initialisation obligatoire. Voir plus : https://www.npmjs.com/package/dotenv
dotenv.config();

console.log("Prod = " + process.env.PROD);

if (process.env.PROD == "true") {
    console.log(process.env.PROD);
    web3.setProvider(new Web3.providers.WebsocketProvider(process.env.TESTNET));
    console.log("Currently on : Testnet \n");
} else {
    web3.setProvider(new Web3.providers.WebsocketProvider(process.env.BC_URL));
    console.log("Currently on : Mainnet \n");
}

export default {
    web3,
};
