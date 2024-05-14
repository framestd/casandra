import { AxiosRequestConfig } from 'axios';

import { rootClient } from './client';

export async function getApplicationInfo(axiosOptions?: AxiosRequestConfig) {
  const response = await rootClient.rootGet(axiosOptions);

  return response;
}
