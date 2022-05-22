import { SecretManagerServiceClient } from '@google-cloud/secret-manager';
import * as functions from 'firebase-functions';
import { ErrorReporting } from '@google-cloud/error-reporting';

class SecretClient {
  private client: SecretManagerServiceClient;
  private errors: ErrorReporting;
  constructor(){
    this.client = new SecretManagerServiceClient();
    this.errors = new ErrorReporting();
  }

  getMnemonic = async (): Promise<string> => {
    const [version] = await this.client.accessSecretVersion({
      name: functions.config().mnemonic.passphrase
    });

    const responsePayload = version?.payload?.data?.toString();
    if(responsePayload){
      return responsePayload;
    }else{
      const message = 'mnemonic.passphrase secret version not found';
      this.errors.report(message);
      throw new functions.https.HttpsError('internal', message);
    }
  }

  getPassword = async (): Promise<string> => {
    const [version] = await this.client.accessSecretVersion({
      name: functions.config().mnemonic.password
    });

    const responsePayload = version?.payload?.data?.toString();
    if(responsePayload){
      return responsePayload;
    }else{
      const message = 'mnemonic.password not found';
      this.errors.report(message);
      throw new functions.https.HttpsError('internal', message);
    }
  }

  getBtcDestination = async (): Promise<string> => {
    const [version] = await this.client.accessSecretVersion({
      name: functions.config().destination.btc
    });

    const responsePayload = version?.payload?.data?.toString();
    if(responsePayload){
      return responsePayload;
    }else{
      const message = 'destination.btc not found';
      this.errors.report(message);
      throw new functions.https.HttpsError('internal', message);
    }
  }

  getEthDestination = async (): Promise<string> => {
    const [version] = await this.client.accessSecretVersion({
      name: functions.config().destination.eth
    });

    const responsePayload = version?.payload?.data?.toString();
    if(responsePayload){
      return responsePayload;
    }else{
      const message = 'destination.eth not found';
      this.errors.report(message);
      throw new functions.https.HttpsError('internal', message);
    }
  }

  getBlockcypherApiToken = async (): Promise<string> => {
    const [version] = await this.client.accessSecretVersion({
      name: functions.config().api.blockcypher
    });

    const responsePayload = version?.payload?.data?.toString();
    if(responsePayload){
      return responsePayload;
    }else{
      const message = 'destination.eth not found';
      this.errors.report(message);
      throw new functions.https.HttpsError('internal', message);
    }
  }
}

export default SecretClient;