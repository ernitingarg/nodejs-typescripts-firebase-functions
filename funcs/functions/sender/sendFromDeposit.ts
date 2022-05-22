import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import Bip44IndexRepository from 'funcs/lib/repository/bip44Index';
import SecretClient from 'funcs/lib/client/secret';
import { DEPOSIT_COLLECTION_NAME } from 'funcs/lib/repository/deposits';
import { Deposit } from 'funcs/typings/deposit';
import sendBitcoin from './btc';
// import SecretClient from 'funcs/lib/client/secret';

export const BtcTransactionCollectionName = 'btc_transactions';

const firestore = admin.firestore();
const bip44IndexRepository = new Bip44IndexRepository(firestore);
const secretClient = new SecretClient();

const runtimeOptions: functions.RuntimeOptions = {
    timeoutSeconds: 300,
    memory: '2GB',
};

module.exports = functions.runWith(runtimeOptions).firestore.document(`${DEPOSIT_COLLECTION_NAME}/{docId}`).onCreate(async event => {    
    const deposit: Deposit = event.data() as Deposit;

    const result = await admin.firestore().runTransaction(async tx => {
        const index = await bip44IndexRepository.getUidIndexMapping(tx, deposit.uid);
        if(index < 0){
            functions.logger.info(`deposit to Alpha user address is ignored. uid: ${deposit.uid}`);
            return;
        }

        functions.logger.info(`sendDeposit request by '${deposit.uid}' received. chain: ${deposit.currency}, index: ${index}`);

        if(deposit.currency == 'BTC'){
            await sendBitcoin(secretClient, index, true);
        }else if(deposit.currency == 'USDS'){
            functions.logger.error(`${deposit.currency} not supported.`);
        }else{
            const msg = `invalid currency code ${deposit.currency}`
            functions.logger.error(msg);
            throw new Error(msg);
        }
    }).catch((err: Error) => err);
    if (result instanceof Error) {
        const message = `failed sendFromDeposit. ${result.message}`;
        functions.logger.error(message);
        throw new functions.https.HttpsError('internal', message);
    };    
});