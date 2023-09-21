import { AxiosRequestConfig } from 'axios';

import { api } from '../base';
import { rootClient } from './client';

export async function getApplicationInfo(axiosOptions?: AxiosRequestConfig) {
  const getRoot = await rootClient.rootGet(axiosOptions);

  const response = await getRoot(api);

  return response;
}
