
export interface EtherApiBundle{
    getNonce: GetNonce;
    estimateGas: EstimateGas;
    broadcastRawtx: BroadcastRawtx;
}

export type GetNonce = (address: string) => Promise<number>;
export type EstimateGas = (payload: string) => Promise<{gasPrice: string, gasLimit: string}>;
export type BroadcastRawtx = (payload: string) => Promise<string>;
