import Web3 from '../web3.js';

const web3 = Web3.web3;
const account = Web3.account;

const block = await web3.eth.getBlock("latest");
const gas_limit = block.gasLimit / block.transactions.length

const dataToSend = "0x4060e2570000000000000000000000000000000000000000000000000000000000000227"
const to = "0xc77ca905b4cd72ec008c415f4eaa7a34286add70"

const transaction = {
    from: account.address,
    to: to,
    value: 0,
    gas: parseInt(gas_limit),
    data: dataToSend,
    type: "0x2",
};

let signTxn = await web3.eth.accounts.signTransaction(transaction, account.privateKey)
console.log("Signed transaction : ");
console.log(signTxn);
let sendTxn = await web3.eth.sendSignedTransaction(signTxn.rawTransaction, handleData)
console.log("Send transaction : ");
console.log(sendTxn);

async function handleData(err, data) {
    if (err) {
        console.error(err);
    } else {
        console.log(data);
    }
}