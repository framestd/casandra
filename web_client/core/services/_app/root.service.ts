import { api } from '../base';
import { rootClient } from './client';

export async function getApplicationInfo() {
  const getRoot = await rootClient.rootGet();

  const response = await getRoot(api);

  return response;
}
