import * as functions from 'firebase-functions';
import CfClient from 'funcs/lib/client/cf';
import { FirebaseConfig } from 'funcs/lib/config';
import CFHostCreator from 'funcs/lib/config/cf';

const runtimeOptions: functions.RuntimeOptions = {
  timeoutSeconds: 300,
  memory: '2GB',
};

const ADMIN_UID = "2CyL37UgUGbNhi1jtu6s1DqLXKx2";

interface RequestData {
  ticket_id: string;
  user: string;
}

const cfHostCreator = new CFHostCreator(FirebaseConfig.defaultConfig())
const cfClient = new CfClient(cfHostCreator.create())

/**
 * withdrawal_doneというCFをproxyで呼ぶCF
 * このCFの意図は、フロントエンドのコードから呼ばれるときにfirebaseのauthがないと呼べないようにしたいためである
 * また、ADMINユーザーしか利用できないようになっている
 */
// withdrawDoneRequestProxy
module.exports = functions.runWith(runtimeOptions).https.onCall(async (data: RequestData, context) => {
  // user dataの確認
  if (!context.auth || !context.auth.uid) {
    console.error(`auth is invalid`);
    throw new functions.https.HttpsError('unauthenticated', 'This function must be called while authenticated.');
  }
  const uid = context.auth.uid;
  if (uid !== ADMIN_UID) {
    console.error('user is not admin')
    throw new functions.https.HttpsError('unauthenticated', 'User is not admin')
  }

  // request dataの確認
  if (!data || !data.ticket_id || !data.user) {
    console.error(`invalid request parameter: ${JSON.stringify(data || {})}`);
    throw new functions.https.HttpsError('invalid-argument', 'invalid request parameter');
  }
  const { ticket_id, user } = data;

  const res = await cfClient.withdrawalDone({ user, ticket_id }).catch((err: Error) => err)
  if (res instanceof Error) {
    throw new functions.https.HttpsError('internal', 'failed withdrawalDone');
  }
});
