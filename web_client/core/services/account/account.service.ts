import { accountClient } from './client';

export async function identifyUserAccountService(axiosOptions?: import('axios').AxiosRequestConfig) {
  const response = await accountClient.identifyUserAccountAccountsMeGet(axiosOptions);

  return response;
}
