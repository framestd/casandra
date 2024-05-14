import { UseSessionOptions, useSession } from 'next-auth/react';

export type AppSessionData = ReturnType<typeof useSession>;

export function useAppSession(options?: UseSessionOptions<boolean>): AppSessionData {
  const session = useSession(options);
  return session;
}
