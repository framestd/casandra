import { useMutation, useQuery } from '@tanstack/react-query';
import { createConnectedService } from './create.service';
import { BaseQueryServiceOptions } from '../types';
import {
  ConnectedServicesProviderEnum,
  StandardResponseConnectedServices,
  StandardResponseListConnectedServices,
  TokenBase,
} from '@/client';
import {
  getConnectedServicesByProviderLabelService,
  getConnectedServicesByProviderService,
  getProviderTokenForLabelService,
} from './connected_services.service';

export enum ConnectedServicesKeysNS {
  GET_CONNECTED_SERVICES = 'connected_services',
  GET_CONNECTED_SERVICES_TOKEN = 'connected_services.token',
}

export type GetConnectedServicesVariables = { id: string; label: string; provider: ConnectedServicesProviderEnum };

export interface GetConnectedServicesByProvider<S>
  extends BaseQueryServiceOptions<
    StandardResponseListConnectedServices,
    Pick<GetConnectedServicesVariables, 'provider'>,
    S
  > {}

export interface GetConnectedServicesByProviderLabel<S>
  extends BaseQueryServiceOptions<
    StandardResponseConnectedServices,
    Pick<GetConnectedServicesVariables, 'label' | 'provider'>,
    S
  > {}

export interface GetProviderTokenForLabelService<S>
  extends BaseQueryServiceOptions<TokenBase, Pick<GetConnectedServicesVariables, 'label' | 'provider'>, S> {}

export function useCreateConnectedServicesService() {
  return useMutation({
    meta: { report_error: true, title: 'Connected Services' },
    mutationFn: async (...args: Parameters<typeof createConnectedService>) => {
      const res = await createConnectedService(...args);

      return res;
    },
  });
}

export function useGetConnectedServicesByProviderLabelService<S>(options: GetConnectedServicesByProviderLabel<S>) {
  const variables = options.variables;
  return useQuery({
    enabled: options.trigger !== false,
    queryKey: [ConnectedServicesKeysNS.GET_CONNECTED_SERVICES, variables],
    queryFn: async () => await getConnectedServicesByProviderLabelService(variables.label, variables.provider),
    select: options.select,
  });
}

export function useGetConnectedServicesByProvider<S>(options: GetConnectedServicesByProvider<S>) {
  const variables = options.variables;
  return useQuery({
    enabled: options.trigger !== false,
    queryKey: [ConnectedServicesKeysNS.GET_CONNECTED_SERVICES, variables],
    queryFn: async () => await getConnectedServicesByProviderService(variables.provider),
    select: options.select,
  });
}

export function useGetProviderTokenForLabelService<S>(options: GetProviderTokenForLabelService<S>) {
  const variables = options.variables;
  return useQuery({
    meta: { report_error: true },
    enabled: options.trigger !== false,
    queryKey: [ConnectedServicesKeysNS.GET_CONNECTED_SERVICES_TOKEN, variables],
    queryFn: async () => await getProviderTokenForLabelService(variables.label, variables.provider),
    select: options.select,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
}
