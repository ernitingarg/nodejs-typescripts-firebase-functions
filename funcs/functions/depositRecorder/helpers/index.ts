import * as admin from 'firebase-admin';
import { AccountCollectionName } from 'funcs/typings/accountCollection';

const getUid = async (tx: admin.firestore.Transaction, accountCollectionName: AccountCollectionName, address: string): Promise<string|undefined> => {
    const db = admin.firestore();
    const collectionName = accountCollectionName as string;
    const refAccount = db.collection(collectionName).where('address', '==', address);
    const docData = await tx.get(refAccount);
    
    if(docData.size > 1){
        const msg = `found more than one "${collectionName}" with address = ${address}`;
        throw new Error(msg);
    }
    const snapshot = docData.docs.pop();
    if(!snapshot){
        return undefined;
    }

    const uid = snapshot.id;
    return uid;
}

export default getUid;