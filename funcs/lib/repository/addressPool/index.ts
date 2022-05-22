import * as admin from 'firebase-admin';
import { AddressPool, FirestoreAddressPool } from 'funcs/typings/address';

export type AddressPoolColName = 'btc_address_pool' | 'eth_address_pool';

class AddressPoolRepository {
  constructor(private readonly firestore: admin.firestore.Firestore) { }
  // usedはすでに割り当てられててるかのフラグで、limitが何個取得するかに関するクエリ
  txGetByUsed = async (tx: admin.firestore.Transaction, { colName, used, limit }: { colName: AddressPoolColName, used: boolean; limit?: number }): Promise<AddressPool[]> => {
    let query = this.firestore.collection(colName).where('used', "==", used);
    if (limit) {
      query = query.limit(limit);
    }

    const snaps = await tx.get(query)
    return snaps.docs.map(snap => ({ ...snap.data() as FirestoreAddressPool, id: snap.id }))
  }

  // usedフィールドを更新する
  txUpdateUsed = (tx: admin.firestore.Transaction, { colName, id }: { colName: AddressPoolColName, id: string }, used: boolean) => {
    const ref = this.firestore.collection(colName).doc(id);
    const data: Pick<FirestoreAddressPool, 'used'> = { used };
    tx.update(ref, data)
  }
}

export default AddressPoolRepository;
