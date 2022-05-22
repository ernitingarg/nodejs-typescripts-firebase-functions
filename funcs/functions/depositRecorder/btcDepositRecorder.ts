import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { BtcTransaction } from 'funcs/typings/transaction';
import { Deposit } from 'funcs/typings/deposit';
import DepositRepository from 'funcs/lib/repository/deposits';
import getUid from './helpers';

export const BTC_TRANSACTION_COLLECTION_NAME = 'btc_transactions';

const firestore = admin.firestore();
const depositRepository = new DepositRepository(firestore);

const runtimeOptions: functions.RuntimeOptions = {
    timeoutSeconds: 300,
    memory: '256MB',
};

module.exports = functions.runWith(runtimeOptions).firestore.document(`${BTC_TRANSACTION_COLLECTION_NAME}/{docId}`).onCreate(async event => {    
    const req: BtcTransaction = event.data() as any;

    const result = await admin.firestore().runTransaction(async tx => {
        const uid = await getUid(tx, 'btc_accounts', req.to);

        if(!uid){
            functions.logger.info(`${req.txhash} is not deposit.`);
            return;
        }

        const deposit: Deposit = {
            currency: 'BTC',
            txid: req.txhash,
            address: req.to,
            uid: uid
        };

        depositRepository.txCreate(tx, deposit);
        functions.logger.info(`BTC deposit to uid[${uid}] recorded. txid: ${req.txhash}`);
        
    }).catch((err: Error) => err);

    if (result instanceof Error) {
        const message = `failed sendFromDeposit. ${result.message}`;
        functions.logger.error(message);
        throw new functions.https.HttpsError('internal', message);
    }
});