import Axios, { AxiosInstance } from 'axios';
import { CurrencyType } from 'funcs/typings/currency';

const PATHS = {
  conversionRequest: () => `/conversion_request`,
  withdrawalRequest: () => `/withdrawal_request`,
  withdrawalDone: () => `/withdrawal_done`,
  withdrawalCancel: () => `/withdrawal_cancel`,
}

class CfClient {
  private readonly client: AxiosInstance;
  constructor(baseURL: string) {
    this.client = Axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
      responseType: 'json',
    });
  }

  conversionRequest = async (reqBody: { user: string; from_currency: CurrencyType; to_currency: CurrencyType; amount: number; argrate: number; }) => {
    const res = await this.client.post(PATHS.conversionRequest(), reqBody);
    return res;
  }

  withdrawalRequest = async (reqBody: { user: string; currency: CurrencyType; amount: number; to: string }) => {
    const res = await this.client.post(PATHS.withdrawalRequest(), reqBody);
    return res;
  }

  withdrawalDone = async (reqBody: { user: string; ticket_id: string; }) => {
    const res = await this.client.post(PATHS.withdrawalDone(), reqBody);
    return res;
  }

  withdrawalCancel = async (reqBody: { user: string; ticket_id: string; }) => {
    const res = await this.client.post(PATHS.withdrawalCancel(), reqBody);
    return res;
  }
}

export default CfClient;
