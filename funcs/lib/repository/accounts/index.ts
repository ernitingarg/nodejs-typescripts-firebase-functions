import * as admin from 'firebase-admin';
import { Account, FirestoreAccount } from 'funcs/typings/address';

export type AccountColName = 'btc_accounts' | 'eth_accounts';

class AccountRepository {
  constructor(private readonly firestore: admin.firestore.Firestore) { }
  // generate btc or eth accounts, which is key-value pair of (userId, address).
  txCreate = (tx: admin.firestore.Transaction, { colName }: { colName: AccountColName }, account: Account) => {
    const ref = this.firestore.collection(colName).doc(account.id)
    const data: FirestoreAccount = { address: account.address }
    tx.create(ref, data);
  }
}

export default AccountRepository;
