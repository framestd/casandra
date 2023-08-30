import { accountClient } from './client';

import { api } from '../base';

export async function identifyUserAccountService() {
  const identifyUserAccount = await accountClient.identifyUserAccountAccountsMeGet();

  const response = await identifyUserAccount(api);

  return response;
}
