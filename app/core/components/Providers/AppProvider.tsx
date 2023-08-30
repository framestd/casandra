'use client';

import { CacheProvider } from '@/chakra-ui/next-js';
import { ChakraProvider, ColorModeScript } from '@/chakra-ui/react';

import { theme } from '@/core/theme/theme';
import { MissingAccessTokenException, isErrorResponse } from '@/core/services';

import { MutationCache, QueryCache, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Fragment, ReactNode } from 'react';
import { ToastContainer } from 'react-toastify';

import { ConfigLoader } from './ConfigLoader';
import { ConfigProvider } from './ConfigProvider';
import { SessionLoader } from './SessionLoader';

import { toast } from '../AppToast';

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

      toast.error({ message: error.message });
    },
  }),

  mutationCache: new MutationCache({
    onError: (error, _variables, _ctx, mutation) => {
      const meta = mutation.meta;
      if (meta === undefined || meta.report_error === false || !isErrorResponse(error)) return;

      if (Array.isArray(error.info.errors)) {
        return error.info.errors.forEach((e, i) => {
          toast.error({ title: i === 0 ? (meta.title as string) : undefined, message: e.message });
        });
      }

      toast.error({ title: meta.title as string, message: error.message });
    },
  }),

  defaultOptions: {
    queries: {
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
      </QueryClientProvider>
    </Fragment>
  );
}
