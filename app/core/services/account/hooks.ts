import { Account } from '@/client/api';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { produce } from 'immer';

import { identifyUserAccountService } from './account.service';
import { authenticateAccountService, reauthenticateAccountService } from './authenticate.service';
import { createAccountService } from './create.service';

import { BaseQueryServiceOptions } from '../types';

export interface IdentifyUserAccountService<S> extends BaseQueryServiceOptions<Account, unknown, S> {}

export enum AccountAPIStaticCacheKeys {
  SESSION_USER = 'session_user',
}

export function useIdentifyUserAccountService<S>(options: IdentifyUserAccountService<S>) {
  return useQuery({
    queryKey: [AccountAPIStaticCacheKeys.SESSION_USER],
    enabled: options.trigger,
    staleTime: Infinity,
    queryFn: identifyUserAccountService,

    select: options.select,
  });
}

export function useCreateAccountService() {
  const queryClient = useQueryClient();

  return useMutation({
    meta: { report_error: true, title: 'Create an account' },
    mutationFn: async (...args: Parameters<typeof createAccountService>) => {
      const res = await createAccountService(...args);

      // write the response data of the account creation request to the ['session_user'] cache
      queryClient.setQueryData<typeof res>([AccountAPIStaticCacheKeys.SESSION_USER], (data) => {
        if (!data) return res;

        const newData = produce(data, (draft) => void (draft.data = res.data));

        return newData;
      });

      return res;
    },
  });
}

export function useAuthenticateAccountService() {
  return useMutation({
    mutationFn: authenticateAccountService,
    meta: { report_error: true, title: 'Sign in to your account' },
  });
}

export function useReuthenticateAccountService() {
  return useMutation({ mutationFn: reauthenticateAccountService });
}
