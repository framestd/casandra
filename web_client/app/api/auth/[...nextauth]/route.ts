import { NextApiRequest, NextApiResponse } from 'next';
import NextAuth from 'next-auth';
import { cookies } from 'next/headers';

import { AuthIntent, getAuthOptions } from '@/core/services/next-auth';
import { AUTH_INTENT_KEY } from '@/core/utils';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const cookieStore = cookies();
  const authIntent = cookieStore.get(AUTH_INTENT_KEY);
  const intent = (authIntent?.value ?? 'access') as AuthIntent;
  return await NextAuth(req, res, getAuthOptions(intent));
}

export { handler as GET, handler as POST };
