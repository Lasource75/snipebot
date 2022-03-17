import Web3 from "../config/node_connection.js";
import contracts from "../Avalanche/preload_contracts.js";

const web3 = Web3.web3;
const t = contracts.TOKEN_TO_SNIPE_PAIR;
const ty = contracts.TOKEN_TO_SNIPE_CONTRACT;

const TRADER_JOE_ROUTER_CONTRACT = contracts.TRADER_JOE_ROUTER_CONTRACT;
const TRADER_JOE_FACTORY_CONTRACT = contracts.TRADER_JOE_FACTORY_CONTRACT;
const PANGOLIN_ROUTER_CONTRACT = contracts.PANGOLIN_ROUTER_CONTRACT;
const PANGOLIN_FACTORY_CONTRACT = contracts.PANGOLIN_FACTORY_CONTRACT;
const TOKEN_TO_SNIPE_PAIR = contracts.TOKEN_TO_SNIPE_PAIR;
const TOKEN_TO_SNIPE_CONTRACT = contracts.TOKEN_TO_SNIPE_CONTRACT;
const TOKEN_PAIR_CONTRACT = contracts.TOKEN_PAIR_CONTRACT;
const MOST_USED_TOKEN_FOR_PAIR = contracts.MOST_USED_TOKEN_FOR_PAIR;

console.log(TOKEN_TO_SNIPE_PAIR);

/*
console.log({
    TRADER_JOE_ROUTER_CONTRACT,
    TRADER_JOE_FACTORY_CONTRACT,
    PANGOLIN_ROUTER_CONTRACT,
    PANGOLIN_FACTORY_CONTRACT,
    TOKEN_TO_SNIPE_PAIR,
    TOKEN_TO_SNIPE_CONTRACT,
    TOKEN_PAIR_CONTRACT,
    MOST_USED_TOKEN_FOR_PAIR,
});
*/

/*
3,6,9,12,15,18
*/
