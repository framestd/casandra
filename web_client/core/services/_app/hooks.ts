import { ApplicationInfo } from '@/client/api';

import { useQuery } from '@tanstack/react-query';

import { getApplicationInfo } from './root.service';

import { BaseQueryServiceOptions } from '../types';

export interface IdentifyUserAccountService<S> extends BaseQueryServiceOptions<ApplicationInfo, unknown, S> {}

export enum RootAPIStaticCacheKeys {
  APPLICATION_INFO = 'application_info',
}

export function useGetApplicationInfo<S>(options: IdentifyUserAccountService<S> = {}) {
  return useQuery({
    queryKey: [RootAPIStaticCacheKeys.APPLICATION_INFO],
    enabled: options.trigger,
    queryFn: getApplicationInfo,

    select: options.select,
  });
}
