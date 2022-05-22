import * as admin from 'firebase-admin';

admin.initializeApp();

const functions = {
  convertRequestProxy: 'token/convertRequestProxy',
  withdrawRequestProxy: 'token/withdrawRequestProxy',
  withdrawDoneRequestProxy: 'token/withdrawDoneRequestProxy',
  withdrawCancelRequestProxy: 'token/withdrawCancelRequestProxy',
  allocateWalletAddress: 'account/allocateWalletAddress',
  depositRecorderBitcoin: 'depositRecorder/btcDepositRecorder',
  sendFromDeposit: 'sender/sendFromDeposit'
};

const loadFunctions = (funcs: Record<string, string>) => {
  for (const name in funcs) {
    if (!process.env.K_SERVICE || process.env.K_SERVICE === name) {
      exports[name] = require(`./funcs/functions/${funcs[name]}`);
    }
  }
};

loadFunctions(functions);
