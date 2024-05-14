'use client';

import { Fragment, ReactNode } from 'react';

import { CacheProvider } from '@/chakra-ui/next-js';
import { ChakraProvider, cookieStorageManagerSSR } from '@/chakra-ui/react';

import { Session as NextAuthSession } from 'next-auth';
import { SessionProvider as NextAuthSessionProvider } from 'next-auth/react';
import { Provider } from 'react-redux';
import { ToastContainer } from 'react-toastify';

import { MutationCache, QueryCache, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

import { store } from '@/core/redux';
import { MissingAccessTokenException } from '@/core/services/config';
import { tokenRegistry } from '@/core/services/next-auth/registry';
import { isErrorResponse } from '@/core/services/utils';
import { theme } from '@/core/theme/theme';
import { COLORMODE_STORAGE_KEY } from '@/core/utils';

import { toast } from '../AppToast';
import { ConfigLoader } from './ConfigLoader';
import { ConfigProvider } from './ConfigProvider';
import { SessionLoader } from './SessionLoader';

export interface AppProviderProps {
  children?: ReactNode;
  session: NextAuthSession | null;
  colormode?: 'dark' | 'light' | (string & Record<never, never>);
}

const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error, query) => {
      if (error instanceof MissingAccessTokenException) {
        // window.location.href = '/signin';
      }

      if (!query.meta?.report_error || !isErrorResponse(error)) return;

      toast.error({ title: error.title, message: error.message });
    },
  }),

  mutationCache: new MutationCache({
    onError: (error, _variables, _ctx, mutation) => {
      const meta = mutation.meta;
      if (meta === undefined || meta.report_error === false || !isErrorResponse(error)) return;

      if (Array.isArray(error.errors)) {
        return error.errors.forEach((e, i) => {
          toast.error({ title: i === 0 ? (error.title as string) : undefined, message: e.message });
        });
      }

      toast.error({ title: error.title as string, message: error.message });
    },
  }),

  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      queryKeyHashFn: (queryKey) => {
        return JSON.stringify(queryKey, (_, value) => {
          if (value instanceof Set) {
            return Array.from(value);
          }
          return value;
        });
      },

      retry(failureCount, error) {
        if (isErrorResponse(error)) return false;
        return failureCount < 3;
      },
    },
  },
});

export function AppProvider({ children, colormode, session }: AppProviderProps) {
  const colormodeCookie = colormode ? `${COLORMODE_STORAGE_KEY}=${colormode}` : '';
  const colorModeManager = cookieStorageManagerSSR(colormodeCookie);

  if (session && session.tokens) tokenRegistry.register(session.tokens);

  return (
    <Fragment>
      <QueryClientProvider client={queryClient}>
        <CacheProvider>
          <ChakraProvider theme={theme} colorModeManager={colorModeManager}>
            <NextAuthSessionProvider session={session}>
              <Provider store={store}>
                <ConfigProvider>
                  <ConfigLoader>
                    <SessionLoader>{children}</SessionLoader>
                  </ConfigLoader>
                </ConfigProvider>
              </Provider>
            </NextAuthSessionProvider>

            <ToastContainer
              className="Toastify-container--customized"
              hideProgressBar={true}
              closeButton={false}
              icon={false}
            />
          </ChakraProvider>
        </CacheProvider>

        <ReactQueryDevtools initialIsOpen={false} position="bottom-right" />
      </QueryClientProvider>
    </Fragment>
  );
}
