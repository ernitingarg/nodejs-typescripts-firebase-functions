import * as bitcoin from 'bitcoinjs-lib';
import { BitcoinApiProvider } from "../api/BitcoinApiProvider";

export class BitcoinSender {
    constructor(
        private api: BitcoinApiProvider,
        private network: bitcoin.networks.Network = bitcoin.networks.bitcoin){

    }

    createSigner = (priv: Buffer, isMainnet = true): bitcoin.ECPair.Signer => {
        const network = isMainnet ? bitcoin.networks.bitcoin : bitcoin.networks.testnet;
        return bitcoin.ECPair.fromPrivateKey(priv, {network: network});
    }

    constructPsbt = async (from: string, to: string): Promise<{ ok: boolean, psbt?: bitcoin.Psbt, error?: string}> => {
        const utxos = await this.api.getUtxos(from);

        if(!utxos?.length){
            return { ok: false, error: `utxo not found for ${from}` };
        }

        const psbt = new bitcoin.Psbt({network: this.network});
        let amountSatoshi = 0;
        for (const utxo of utxos) {
            const rawtx = await this.api.getRawtx(utxo.hash);

            if(!utxo.script) return {ok: false};

            psbt.addInput({                
                hash: Buffer.from(utxo.hash_le, 'hex'),
                index: utxo.index,
                witnessUtxo: {
                    script: Buffer.from(utxo.script, 'hex'),
                    value: utxo.value
                },
                nonWitnessUtxo: Buffer.from(rawtx, 'hex'),
                // redeemScript: Buffer.from(bitcoin.payments.p2sh., 'hex') for P2SH
            });
            amountSatoshi += utxo.value;
        }

        const feeSatoshi = await this.api.getFeeSatoshi(250);
        if(feeSatoshi > 100000){
            return { ok: false, error: `too expensive fee: ${feeSatoshi} satoshi` };
        }

        psbt.addOutput({
            address: to,
            value: amountSatoshi - feeSatoshi
        });

        return { ok: true, psbt: psbt };
    }

    constructBuilder = async (from: string, to: string): Promise<{ ok: boolean, tx?: bitcoin.TransactionBuilder}> => {
        const utxos = await this.api.getUtxos(from);

        if(!utxos?.length){
            return { ok: false };
        }

        const tx = new bitcoin.TransactionBuilder();
        let amountSatoshi = 0;
        for (const utxo of utxos) {
            tx.addInput(utxo.hash, utxo.index)
            amountSatoshi += utxo.value;
        }
        
        const feeSatoshi = await this.api.getFeeSatoshi(250);
        if(feeSatoshi > 1000000){
            return { ok: false };
        }

        tx.addOutput(to, amountSatoshi - feeSatoshi);

        return {ok: true, tx: tx };
    }

    sign = (tx: bitcoin.TransactionBuilder, signer: bitcoin.ECPair.Signer): string => {
        tx.sign(0, signer);
        return tx.build().toHex();
    }

    signPsbt = (psbt: bitcoin.Psbt, signer: bitcoin.ECPair.Signer): string => {
        psbt.signAllInputs(signer);

        if(!psbt.validateSignaturesOfAllInputs())
            throw new Error(`signatures invalid`);
        
        psbt.finalizeAllInputs();
        const transaction = psbt.extractTransaction();
        return transaction.toHex();
    }

    broadcast = async (payload: string): Promise<{success: boolean, hash?: string}> => {
        return await this.api.broadcast(payload);
    }
}