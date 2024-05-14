import { ConnectedServicesProviderEnum } from '@/client';
import { connectedServicesClient } from './client';

export async function getProviderTokenForLabelService(label: string, provider: ConnectedServicesProviderEnum) {
  const response = await connectedServicesClient.getProviderTokenForLabelConnectedServicesOauthProviderLabelTokenGet({
    label,
    provider,
  });

  return response;
}

export async function getConnectedServicesByProviderService(provider: ConnectedServicesProviderEnum) {
  const response = await connectedServicesClient.getConnectedServicesByProviderConnectedServicesByProviderGet({
    provider,
  });

  return response;
}

export async function getConnectedServicesByProviderLabelService(
  label: string,
  provider: ConnectedServicesProviderEnum,
) {
  const response = await connectedServicesClient.getConnectedServicesByProviderLabelConnectedServicesByProviderLabelGet(
    {
      label,
      provider,
    },
  );

  return response;
}

export async function getConnectedServicesById(id: string) {
  const response = await connectedServicesClient.getConnectedServicesByIdConnectedServicesIdGet({
    id,
  });

  return response;
}
