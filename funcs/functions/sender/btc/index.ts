import SecretClient from "funcs/lib/client/secret";
import { BitcoinApiProvider } from "funcs/lib/service/api/BitcoinApiProvider";
import { BitcoinSender } from "funcs/lib/service/sender/BitcoinSender";
import { generateKeyPair } from "funcs/lib/service/bip44/keygen";
import * as bitcoin from 'bitcoinjs-lib';
import * as functions from 'firebase-functions';

const sendBitcoin = async (secretClient: SecretClient, index: number, mainnet: boolean = true) => {
    const mnemonic = await secretClient.getMnemonic();
    const password = await secretClient.getPassword();
    const dest = await secretClient.getBtcDestination();
    const blockcypherToken = await secretClient.getBlockcypherApiToken();
    const network = mainnet ? bitcoin.networks.bitcoin : bitcoin.networks.testnet;

    const api = new BitcoinApiProvider(blockcypherToken);
    const sender = new BitcoinSender(api, network);
    const keypair = await generateKeyPair('bitcoin', mnemonic, password, index);

    const { ok, psbt, error } = await sender.constructPsbt(keypair.address, dest);
    if(!ok || !psbt){
        const msg = `failed to create PSBT ${keypair.address}. reason: ${error}`;
        functions.logger.error(msg);
        throw new Error(msg);
    }

    const signer = sender.createSigner(keypair.priv);
    const payload = sender.signPsbt(psbt, signer);

    functions.logger.info(`payload: ${payload}`);

    const res = await sender.broadcast(payload);
    console.log(`broadcasted:`, JSON.stringify(res));
}

export default sendBitcoin;