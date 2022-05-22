import * as functions from 'firebase-functions';
import { mnemonicToSeed } from 'bip39';
import { ECPair, payments } from 'bitcoinjs-lib';
import HdKey from 'hdkey';
import { hdkey } from 'ethereumjs-wallet';
import { BlockchainType } from 'funcs/typings/blockchain';

export interface KeyPair {
    address: string;
    pub: Buffer;
    priv: Buffer;
}

export const generateAddress = async (chain: BlockchainType, mnemonic: string, password: string, index: number): Promise<string> => {
    const keypair = await generateKeyPair(chain, mnemonic, password, index);
    return keypair.address;
}

export const generateKeyPair = async (chain: BlockchainType, mnemonic: string, password: string, index: number): Promise<KeyPair> => {
    switch(chain){
        case 'bitcoin':
            return (await generateBitcoinKeyPair(mnemonic, index, password));
        case 'ethereum':
            return (await generateEthKeyPair(mnemonic, index, password));
        default:
            throw new functions.https.HttpsError('invalid-argument', `invalid currency type: ${chain}`);
    }
}

const generateBitcoinKeyPair = async (mnemonic: string, index: number, password: string): Promise<KeyPair> => {
    const seed = await mnemonicToSeed(mnemonic, password);
    const root = HdKey.fromMasterSeed(seed);
    const child = root.derive(`m/44'/0'/0'/0/${index}`);
    const keyPair = ECPair.fromPrivateKey(child.privateKey);

    const { address } = payments.p2pkh({ pubkey: keyPair.publicKey });
    if(!address){
        const message = 'failed to generate BTC address';
        functions.logger.error(message);
        throw new functions.https.HttpsError('internal', message);
    }

    if(!keyPair.privateKey){
        const message = 'failed to generate BTC privatekey';
        functions.logger.error(message);
        throw new functions.https.HttpsError('internal', message);
    }

    return {
        address: address,
        pub: keyPair.publicKey,
        priv: keyPair.privateKey
    };
}

const generateEthKeyPair = async (mnemonic: string, index: number, password: string): Promise<KeyPair> => {
    const seed = await mnemonicToSeed(mnemonic, password);
    const root = hdkey.fromMasterSeed(seed);
    const child = root.derivePath(`m/44'/60'/0'/0/${index}`);
    const wallet = child.getWallet();

    return {
        address: wallet.getChecksumAddressString(),
        pub: wallet.getPublicKey(),
        priv: wallet.getPrivateKey()
    };
}