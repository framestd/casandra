import { cache } from 'react';

import { getApplicationInfo } from '../root';
import { readConversationByIdService } from '../conversation';
import { getAppServerSession } from '../next-auth';
import { getAuthorization } from '@/core/utils';
import { AxiosRequestConfig } from 'axios';

const extendOptionsWithAuth = async (options?: AxiosRequestConfig): Promise<AxiosRequestConfig> => {
  const session = await getAppServerSession();
  const auth = getAuthorization(session && session.tokens!);
  return { ...options, headers: { ...options?.headers, Authorization: auth } };
};

export const getServerApplicationInfo = cache(getApplicationInfo);
export const readServerConversationById = cache<typeof readConversationByIdService>(async (id, options) => {
  return await readConversationByIdService(id, await extendOptionsWithAuth(options));
});
