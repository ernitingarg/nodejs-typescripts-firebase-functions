import { Transaction, TxData } from "ethereumjs-tx";
import Web3 from "web3";
import { BroadcastRawtx, EstimateGas, GetNonce } from "../../../typings/api/EthereumApiModels";

import { abiMin } from '../../../typings/abi/ERC20.min';
import BN from "bn.js";

export class EtherSender {
    private web3: Web3;

    constructor(
        endpoint: string,
        private chain: 'mainnet' | 'ropsten'
    ){
        this.web3 = new Web3();
        this.web3.setProvider(new Web3.providers.HttpProvider(endpoint));
    }

    createTransferEth = async (from: string, to: string, amount: number): Promise<TxData> => {
        const nonce = await this.getNonce(from);
        const {gasLimit, gasPrice} = await this.estimateGas('');
        const amountWei = this.web3.utils.toWei(new BN(amount));
        const amountHex = this.web3.utils.numberToHex(amountWei);

        const txData: TxData = {
            nonce: nonce,
            gasPrice: gasPrice,
            gasLimit: gasLimit,
            to: to,
            value: amountHex
        };

        return txData;
    }

    createTransferToken = async (contractAddress: string, from: string, to: string, amount: number): Promise<TxData> => {
        const nonce = await this.getNonce(from);
        const {gasLimit, gasPrice} = await this.estimateGas('');
        const amountWei = this.web3.utils.toWei(new BN(amount));
        const amountHex = this.web3.utils.numberToHex(amountWei);

        const contract = new this.web3.eth.Contract(abiMin, contractAddress);
        const data = contract.methods.transfer(to, amountHex).encodeABI();

        const txData: TxData = {
            nonce: nonce,
            gasPrice: gasPrice,
            gasLimit: gasLimit,
            to: contractAddress,
            value: 0x00,
            data: data
        };

        return txData;
    }

    getNonce: GetNonce = (address: string) => this.web3.eth.getTransactionCount(address);

    estimateGas: EstimateGas = async (payload: string): Promise<{
        gasPrice: string;
        gasLimit: string;
    }> => {
        const gasPriceNum = await this.web3.eth.getGasPrice();
        const gas = 90000;
        payload;
        
        return {
            gasPrice: this.web3.utils.toHex(gasPriceNum),
            gasLimit: this.web3.utils.toHex(gas)
        }
    }

    sign = async (privateKey: Buffer, txData: TxData): Promise<string> => {
        const tx = new Transaction(txData, { chain: this.chain });
        tx.sign(privateKey);
        const payload = tx.serialize();
        const rawTx = '0x' + payload.toString('hex');
        return rawTx;
    }

    broadcast: BroadcastRawtx = async (payload: string) => {
        const result = await this.web3.eth.sendSignedTransaction(payload);
        return result.transactionHash;
    }
}