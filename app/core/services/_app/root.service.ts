import { rootClient } from './client';

import { api } from '../base';

export async function getApplicationInfo() {
  const getRoot = await rootClient.rootGet();

  const response = await getRoot(api);

  return response;
}
