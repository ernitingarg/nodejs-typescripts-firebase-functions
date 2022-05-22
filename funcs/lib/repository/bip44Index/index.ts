import * as admin from 'firebase-admin';
import { Bip44IndexCounterName, CounterCollectionName } from 'funcs/typings/counter';

export const UidIndexMappingCollectionName = 'uid_index_mapping';
export const IndexUidMappingCollectionName = 'index_uid_mapping';

class Bip44IndexRepository {
  constructor(private readonly firestore: admin.firestore.Firestore) { }
  
  getOrCreateUidIndexMapping = async (tx: admin.firestore.Transaction, uid: string): Promise<number> => {
    const ref = this.firestore.collection(UidIndexMappingCollectionName).doc(uid);
    const doc = await tx.get(ref);

    if(doc.exists){
      const data: any = doc.data();
      return data.index;
    }

    const nextCount = await this.getNextCounter(tx);

    this.createOrSetNextCount(tx, nextCount);
    this.createIndexUidMapping(tx, nextCount, uid);

    const entry = { index: nextCount };
    tx.create(ref, entry);

    return nextCount;
  }

  getUidIndexMapping = async (tx: admin.firestore.Transaction, uid: string): Promise<number> => {
    const ref = this.firestore.collection(UidIndexMappingCollectionName).doc(uid);
    const doc = await tx.get(ref);

    if(!doc.exists)
      return -1;

    const data: any = doc.data();
    return data.index;
  }

  private createIndexUidMapping = (tx: admin.firestore.Transaction, index: number, uid: string) => {
    const ref = this.firestore.collection(IndexUidMappingCollectionName).doc(index.toString());
    tx.create(ref, {uid: uid});
  }

  private getNextCounter = async (tx: admin.firestore.Transaction): Promise<number> => {
    const ref = this.firestore.collection(CounterCollectionName).doc(Bip44IndexCounterName);
    const doc = await tx.get(ref);

    if(doc.exists){
      const currentCount = parseInt((doc.data() as any).count);
      const nextCount = currentCount + 1;
      return nextCount;
    }else{
      return 1;
    }
  }

  private createOrSetNextCount = (tx: admin.firestore.Transaction, nextCount: number) => {
    const ref = this.firestore.collection(CounterCollectionName).doc(Bip44IndexCounterName);
    const data = {name: Bip44IndexCounterName, count: nextCount};
    tx.set(ref, data);
  }
}

export default Bip44IndexRepository;