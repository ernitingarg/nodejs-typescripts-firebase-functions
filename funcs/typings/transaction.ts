export interface BtcTransaction {
    amount: number;
    to: string;
    txhash: string;
}

export type BtcBroadcastStatus = 'SENT' | 'UNSENT' | 'OTHER';

export interface BtcSignedPayload {
    from: string;
    payload: string;
    status: BtcBroadcastStatus;
    hash: string;
}