import * as admin from 'firebase-admin';
import { BtcBroadcastStatus, BtcSignedPayload } from 'funcs/typings/transaction';

export const BtcSignedPayloadCollectionName = 'btc_signed_payloads';

class BtcSignedPayloadRepository {
  constructor(private readonly firestore: admin.firestore.Firestore) { }

  createPayload = async (tx: admin.firestore.Transaction, uid: string, payload: string, status: BtcBroadcastStatus, hash: string = ''): Promise<void> => {
    const ref = this.firestore.collection(BtcSignedPayloadCollectionName).doc(uid);

    const data: BtcSignedPayload = {
        from: uid,
        payload: payload,
        hash: hash,
        status: status
    }
    tx.create(ref, data);
  }
}

export default BtcSignedPayloadRepository;