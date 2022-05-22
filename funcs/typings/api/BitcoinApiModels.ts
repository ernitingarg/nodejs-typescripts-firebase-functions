export interface Utxo {
    hash: string;
    hash_le: string;
    index: number;
    value: number;
    script?: string;
};

export type GetUtxos = (address: string) => Promise<Utxo[]>;
export type GetFeeSatoshi = (size: number) => Promise<number>;
export type GetRawTxHex = (txid: string) => Promise<string>;
export type BroadcastRawtx = (payload: string) => Promise<{success: boolean, hash?: string}>;