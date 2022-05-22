import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import SecretClient from 'funcs/lib/client/secret';
import AccountRepository, { AccountColName } from 'funcs/lib/repository/accounts';
import  { AddressPoolColName } from 'funcs/lib/repository/addressPool';
import BalanceRepository from 'funcs/lib/repository/balances';
import Bip44IndexRepository from 'funcs/lib/repository/bip44Index';
import { generateAddress } from 'funcs/lib/service/bip44/keygen';
import { Account } from 'funcs/typings/address';
import { BlockchainType } from 'funcs/typings/blockchain';

const runtimeOptions: functions.RuntimeOptions = {
  timeoutSeconds: 300,
  memory: '2GB',
};

interface RequestData {
  blockchainType: BlockchainType;
}

const firestore = admin.firestore();
const accountRepository = new AccountRepository(firestore);
const balanceRepository = new BalanceRepository(firestore);
const bip44IndexRepository = new Bip44IndexRepository(firestore);

const secretClient = new SecretClient();

const getCollectionsName = (blockchainType: BlockchainType): { account: AccountColName; addressPool: AddressPoolColName } => {
  switch (blockchainType) {
    case 'bitcoin':
      return {
        account: 'btc_accounts',
        addressPool: 'btc_address_pool',
      }
    case 'ethereum':
      return {
        account: 'eth_accounts',
        addressPool: 'eth_address_pool',
      }
    default:
      throw new Error(`invalid blockchainType. type: ${blockchainType}`)
  }
}

/**
 * btc or ethのアドレスをfirebaseのuserに割り当てるCF
 * btcの場合、btc_address_poolから１つアドレスが選ばれ、それがfirebaseのuserIdをドキュメントIDとする btc_accounts/{userId} のドキュメントとして割り当てられる
 * ethの場合、eth_address_poolから１つアドレスが選ばれ、それがfirebaseのuserIdをドキュメントIDとする eth_accounts/{userId} のドキュメントとして割り当てられる
 */
// allocateWalletAddress
module.exports = functions.runWith(runtimeOptions).https.onCall(async (data: RequestData, context) => {
  // validate user data
  if (!context.auth || !context.auth.uid) {
    functions.logger.error(`auth is invalid`);
    throw new functions.https.HttpsError('unauthenticated', 'This function must be called while authenticated.');
  }
  const uid = context.auth.uid;

  // validate request data
  if (!data || !data.blockchainType) {
    functions.logger.error(`invalid request parameter: ${JSON.stringify(data || {})}`);
    throw new functions.https.HttpsError('invalid-argument', 'invalid request parameter');
  }
  const { blockchainType } = data;

  // BTCとETHではコレクション名が違うので、それらに合うコレクション名を取得
  const colNames = getCollectionsName(blockchainType);

  const result = await admin.firestore().runTransaction(async tx => {
    // get balance info
    const balance = await balanceRepository.getBalance(tx, uid);


    //  obtain bip44 path
    const index = await bip44IndexRepository.getOrCreateUidIndexMapping(tx, uid);
    const mnemonic = await secretClient.getMnemonic();
    const password = await secretClient.getPassword();

    functions.logger.info(`address request by '${uid}' received. chain: ${blockchainType}, index: ${index}`);

    //  generate address with obtained path
    const address = await generateAddress(blockchainType, mnemonic, password, index);
    functions.logger.info(`address generated. address: ${address}`);

    const account: Account = { id: uid, address: address }

    // create user's account firestore entry
    accountRepository.txCreate(tx, { colName: colNames.account }, account)

    // initalize balance
    if (!balance?.BTC) {
      balanceRepository.txInitializeBalance(tx, { type: 'BTC', uid })
    }
    if (!balance?.USDS) {
      balanceRepository.txInitializeBalance(tx, { type: 'USDS', uid })
    }
  }).catch((err: Error) => err)
  if (result instanceof Error) {
    const message = `failed allocateWalletAddress. ${result.message}`;
    functions.logger.error(message);
    throw new functions.https.HttpsError('internal', message);
  }
});
