import { Utxo } from "../../../typings/api/BitcoinApiModels";
import axios, { AxiosResponse } from 'axios';
import * as functions from 'firebase-functions';

export class BitcoinApiProvider {

    constructor(private blockcypherToken: string){

    }

    /**
     * https://www.blockchain.com/api/blockchain_api
     * @returns 
     */
    getUtxos = async (address: string): Promise<Utxo[]> => {
        const result = await axios.get<{notice?: string, unspent_outputs: BlockchainComUtxoModel[]}>(`https://blockchain.info/unspent?active=${address}`);       
        functions.logger.info(`utxo query result [${result.status}]:`, JSON.stringify(result.data));
        let utxos: Utxo[] = [];
        for (const each of result.data.unspent_outputs) {
            const item = {
                hash: switchEndianness(each.tx_hash),
                hash_le: each.tx_hash,
                index: parseInt(each.tx_output_n),
                value: parseInt(each.value),
                script: each.script
            };
            utxos.push(item);
        }
        return utxos;
    }

    /**
     * https://bitcoinfees.earn.com/api
     * @returns 
     */
    getFeeSatoshi = async (size: number): Promise<number> => {
        const result = await axios.get<BitcoinfeesRecommendedFeeModel>(`https://bitcoinfees.earn.com/api/v1/fees/recommended`);
        const feePerByte = result.data.halfHourFee;
        return feePerByte * size;
    }

    /**
     * https://www.blockchain.com/api/blockchain_api
     * @returns 
     */
    getRawtx = async (txidBigEndian: string): Promise<string> => {
        const result = await axios.get<string>(`https://blockchain.info/rawtx/${txidBigEndian}?format=hex`);
        return result.data;
    }

    /**
     * https://www.blockcypher.com/dev/bitcoin/?shell#push-raw-transaction-endpoint
     * @returns 
     */
    broadcast = async (payload: string): Promise<{success: boolean, hash?: string}> => {
        const req = {
            tx: payload
        };
        const result = await axios.post<{tx: string}, AxiosResponse<any>>(`https://api.blockcypher.com/v1/btc/main/txs/push?token=${this.blockcypherToken}`, req);
        
        functions.logger.info(`broadcast result[${result.statusText}]: `, result.data);
        
        if(result.status !== 200)
            return { success: false };
        
        return {
            success: true,
            hash: result.data.hash
        };
    }
}

const switchEndianness = (hexString: string): string => {
    const result = [];
    let len = hexString.length - 2;
    while (len >= 0) {
      result.push(hexString.substr(len, 2));
      len -= 2;
    }
    return result.join('');
}

interface BlockchainComUtxoModel {
    tx_age: string;
    tx_hash: string;
    tx_index: string;
    tx_output_n: string;
    script: string;
    value: string;
}

interface BitcoinfeesRecommendedFeeModel {
    fastestFee: number;
    halfHourFee: number;
    hourFee: number;
}
