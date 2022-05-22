import Web3 from "web3";
import { BroadcastRawtx, EstimateGas, GetNonce } from "../../../typings/api/EthereumApiModels";

export class EtherApiProvider {
    private web3: Web3;
    constructor(endpoint: string){
        this.web3 = new Web3();
        this.web3.setProvider(new Web3.providers.HttpProvider(endpoint));
    }

    getNonce: GetNonce = (address: string) => this.web3.eth.getTransactionCount(address);

    estimateGas: EstimateGas = async (payload: string): Promise<{
        gasPrice: string;
        gasLimit: string;
    }> => {
        const gas = 90000;
        payload;
        
        return {
            gasPrice: await this.web3.eth.getGasPrice(),
            gasLimit: this.web3.utils.toHex(gas)
        }
    }

    broadcast: BroadcastRawtx = async (payload: string) => {
        const res = await this.web3.eth.sendSignedTransaction(payload);
        return res.transactionHash;
    }
}