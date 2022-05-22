import { CurrencyType } from "./currency";

export interface Deposit {
    currency: CurrencyType;
    uid: string;
    address: string;
    txid: string;
    n0?: string;
    n1?: string;
}