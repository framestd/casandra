import { AxiosRequestConfig } from 'axios';
import { api } from '../base';
import { accountClient } from './client';

export async function identifyUserAccountService(axiosOptions?: AxiosRequestConfig) {
  const identifyUserAccount = await accountClient.identifyUserAccountAccountsMeGet(axiosOptions);

  const response = await identifyUserAccount(api);

  return response;
}
