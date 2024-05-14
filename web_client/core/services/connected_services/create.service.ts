import { ConnectedServicesCreate } from '@/client';
import { connectedServicesClient } from './client';

export async function createConnectedService(connectedServicesCreate: ConnectedServicesCreate) {
  const response = await connectedServicesClient.connectGoogleOauthConnectedServicesOauthGooglePost({
    connectedServicesCreate,
  });

  return response;
}
