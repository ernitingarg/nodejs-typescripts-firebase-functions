import * as admin from 'firebase-admin';
import { Deposit } from 'funcs/typings/deposit';

export const DEPOSIT_COLLECTION_NAME = 'deposits';

class DepositRepository {
    constructor(private readonly firestore: admin.firestore.Firestore) { }

    txCreate = (tx: admin.firestore.Transaction, deposit: Deposit) => {
        const ref = this.firestore.collection(DEPOSIT_COLLECTION_NAME).doc();
        tx.create(ref, deposit);
    }
}

export default DepositRepository;
