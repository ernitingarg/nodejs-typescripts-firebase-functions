import * as functions from 'firebase-functions';
import CfClient from 'funcs/lib/client/cf';
import { FirebaseConfig } from 'funcs/lib/config';
import CFHostCreator from 'funcs/lib/config/cf';
import { CurrencyType } from 'funcs/typings/currency';

const runtimeOptions: functions.RuntimeOptions = {
  timeoutSeconds: 300,
  memory: '2GB',
};

interface RequestData {
  currency: CurrencyType;
  amount: number;
  to: string;
}

const cfHostCreator = new CFHostCreator(FirebaseConfig.defaultConfig())
const cfClient = new CfClient(cfHostCreator.create())

/**
 * withdrawal_requestというCFをproxyで呼ぶCF
 * このCFの意図は、フロントエンドのコードから呼ばれるときにfirebaseのauthがないと呼べないようにしたいためである
 */
// withdrawRequestProxy
module.exports = functions.runWith(runtimeOptions).https.onCall(async (data: RequestData, context) => {
  // user dataの確認
  if (!context.auth || !context.auth.uid) {
    console.error(`auth is invalid`);
    throw new functions.https.HttpsError('unauthenticated', 'This function must be called while authenticated.');
  }
  const uid = context.auth.uid;

  // request dataの確認
  if (!data || !data.currency || !data.amount || !data.to) {
    console.error(`invalid request parameter: ${JSON.stringify(data || {})}`);
    throw new functions.https.HttpsError('invalid-argument', 'invalid request parameter');
  }
  const { currency, amount, to } = data;

  const res = await cfClient.withdrawalRequest({ user: uid, currency, amount, to }).catch((err: Error) => err)
  if (res instanceof Error) {
    throw new functions.https.HttpsError('internal', 'failed withdrawalRequest');
  }
});
