import { Token } from '@/client';
import { CasandraSessionUser } from '@/core/services/next-auth';

declare module 'next-auth' {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: CasandraSessionUser;
    tokens?: Token;
  }

  interface User {
    /** Only present when using credentials provider */
    tokens?: Token;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    tokens?: Token;
  }
}
