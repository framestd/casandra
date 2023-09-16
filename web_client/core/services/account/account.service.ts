import { api } from '../base';
import { accountClient } from './client';

export async function identifyUserAccountService() {
  const identifyUserAccount = await accountClient.identifyUserAccountAccountsMeGet();

  const response = await identifyUserAccount(api);

  return response;
}
