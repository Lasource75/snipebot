import Web3 from "../config/node_connection.js";
import axios from "axios";
import fs from "fs";

const web3 = Web3.web3;

//Les cas à traiter sont les valeurs pour lesquels unit = 4,5,7,8,10,11,13,14,16 ou 17
function getValueOfWei(value, unit) {
    switch (unit) {
        case 3:
            return web3.utils.fromWei(value, "babbage");
        case 6:
            return web3.utils.fromWei(value, "lovelace");
        case 9:
            return web3.utils.fromWei(value, "shanon");
        case 12:
            return web3.utils.fromWei(value, "szabo");
        case 15:
            return web3.utils.fromWei(value, "finney");
        case 18:
            return web3.utils.fromWei(value, "ether");
        default:
            break;
    }
    // Attention, peux poser des soucis avec une valeur assez grande.
    return Number(Number(value) / Number(10 ** unit));
}

export default {
    web3,
    axios,
    fs,
    getValueOfWei,
};
