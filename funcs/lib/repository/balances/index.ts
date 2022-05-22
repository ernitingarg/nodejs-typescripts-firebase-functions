import * as admin from 'firebase-admin';
import { FirestoreBalance } from 'funcs/typings/balance';
import { CurrencyType } from 'funcs/typings/currency';

const colName = 'balances';

class BalanceRepository {
  constructor(private readonly firestore: admin.firestore.Firestore) { }

  private getBalanceInitializeData = (type: CurrencyType) => {
    switch (type) {
      case 'BTC': {
        const data: Pick<FirestoreBalance, 'BTC'> = { BTC: 0 }
        return data;
      }
      case 'USDS': {
        const data: Pick<FirestoreBalance, 'USDS'> = { USDS: 0 }
        return data;
      }
      default:
        throw new Error('invalid type')
    }
  }

  // balanceデータをBTC/ETH選択して初期化する
  txInitializeBalance = (tx: admin.firestore.Transaction, params: { type: CurrencyType; uid: string }) => {
    const ref = this.firestore.collection(colName).doc(params.uid);
    const initializedBalance = this.getBalanceInitializeData(params.type);
    tx.set(ref, initializedBalance, { merge: true })
  }

  // balance情報を取得する
  getBalance = async (tx: admin.firestore.Transaction,  uid: string) => {
    const ref = this.firestore.collection(colName).doc(uid);
    const snap = await tx.get(ref);
    return snap.data() as FirestoreBalance | undefined;
  }
}

export default BalanceRepository;
