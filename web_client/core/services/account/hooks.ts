import { produce } from 'immer';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { StandardResponseAccount } from '@/client/api';

import { BaseQueryServiceOptions } from '../types';
import { identifyUserAccountService } from './account.service';
import { authenticateAccountService, reauthenticateAccountService } from './authenticate.service';
import { createAccountService } from './create.service';

export interface IdentifyUserAccountServiceOptions<S>
  extends BaseQueryServiceOptions<StandardResponseAccount, unknown, S> {}

export enum AccountKeysNS {
  SESSION_USER = 'session_user',
}

export function useIdentifyUserAccountService<S>(options: IdentifyUserAccountServiceOptions<S>) {
  return useQuery({
    queryKey: [AccountKeysNS.SESSION_USER],
    enabled: options.trigger,
    staleTime: Infinity,
    queryFn: async ({ signal }) => await identifyUserAccountService({ signal }),

    select: options.select,
  });
}

export function useCreateAccountService() {
  const queryClient = useQueryClient();

  return useMutation({
    meta: { report_error: true, title: 'Create an Account' },
    mutationFn: async (...args: Parameters<typeof createAccountService>) => {
      const res = await createAccountService(...args);

      // write the response data of the account creation request to the ['session_user'] cache
      queryClient.setQueryData<typeof res>([AccountKeysNS.SESSION_USER], (data) => {
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
    meta: { report_error: true, title: 'Sign in to Your Account' },
  });
}

export function useReuthenticateAccountService() {
  return useMutation({ mutationFn: reauthenticateAccountService });
}
