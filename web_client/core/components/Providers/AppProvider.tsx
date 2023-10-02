'use client';

import { Fragment, ReactNode } from 'react';

import { CacheProvider } from '@/chakra-ui/next-js';
import { ChakraProvider, ColorModeScript } from '@/chakra-ui/react';

import { ToastContainer } from 'react-toastify';

import { MutationCache, QueryCache, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

import { isErrorResponse, MissingAccessTokenException } from '@/core/services';
import { theme } from '@/core/theme/theme';

import { toast } from '../AppToast';
import { ConfigLoader } from './ConfigLoader';
import { ConfigProvider } from './ConfigProvider';
import { SessionLoader } from './SessionLoader';

export interface AppProviderProps {
  children?: ReactNode;
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

export function AppProvider({ children }: AppProviderProps) {
  return (
    <Fragment>
      <ColorModeScript initialColorMode={theme.config.initialColorMode} />

      <QueryClientProvider client={queryClient}>
        <CacheProvider>
          <ChakraProvider theme={theme}>
            <ConfigProvider>
              <ConfigLoader>
                <SessionLoader>{children}</SessionLoader>
              </ConfigLoader>
            </ConfigProvider>

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
