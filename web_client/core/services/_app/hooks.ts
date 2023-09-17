import { useQuery } from '@tanstack/react-query';

import { ApplicationInfo } from '@/client/api';

import { BaseQueryServiceOptions } from '../types';
import { getApplicationInfo } from './root.service';

export interface GetApplicationInfoOptions<S> extends BaseQueryServiceOptions<ApplicationInfo, unknown, S> {}

export enum QueryKeyNamespace {
  APPLICATION_INFO = 'application_info',
}

export function useGetApplicationInfo<S>(options: GetApplicationInfoOptions<S> = {}) {
  return useQuery({
    queryKey: [QueryKeyNamespace.APPLICATION_INFO],
    enabled: options.trigger,
    queryFn: getApplicationInfo,

    select: options.select,
  });
}
