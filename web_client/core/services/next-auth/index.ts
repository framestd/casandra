import { getServerSession } from 'next-auth';
import { getAuthOptions } from './options';

export * from './options';

export async function getAppServerSession() {
  return await getServerSession(getAuthOptions('access'));
}
