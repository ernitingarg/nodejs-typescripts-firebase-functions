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
  from_currency: CurrencyType;
  to_currency: CurrencyType;
  amount: number;
  argrate: number;
}

const cfHostCreator = new CFHostCreator(FirebaseConfig.defaultConfig())
const cfClient = new CfClient(cfHostCreator.create())

/**
 * conversion_requestというCFをproxyで呼ぶCF
 * このCFの意図は、フロントエンドのコードから呼ばれるときにfirebaseのauthがないと呼べないようにしたいためである
 */
// convertRequestProxy
module.exports = functions.runWith(runtimeOptions).https.onCall(async (data: RequestData, context) => {
  // user dataの確認
  if (!context.auth || !context.auth.uid) {
    console.error(`auth is invalid`);
    throw new functions.https.HttpsError('unauthenticated', 'This function must be called while authenticated.');
  }
  const uid = context.auth.uid;

  // request dataの確認
  if (!data || !data.from_currency || !data.to_currency || !data.amount || !data.argrate) {
    console.error(`invalid request parameter: ${JSON.stringify(data || {})}`);
    throw new functions.https.HttpsError('invalid-argument', 'invalid request parameter');
  }
  const { from_currency, to_currency, amount, argrate } = data;

  const res = await cfClient.conversionRequest({ user: uid, from_currency, to_currency, amount, argrate }).catch((err: Error) => err)
  if (res instanceof Error) {
    console.error(res)
    throw new functions.https.HttpsError('internal', `failed conversionRequest. error: ${res.message}. stack: ${res.stack}`);
  }
});
