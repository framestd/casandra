import { Configuration } from '@/client/configuration';

import { SERVER_BASE_PATH, SERVER_BASE_URL, SERVER_INTERNAL_ADDRESS } from '../utils';
import { getAccessToken as getAccessTokenFromRegistry } from './next-auth/registry';

export class MissingAccessTokenException extends Error {
  name = MissingAccessTokenException.name;
}

export function getServerBaseURL(pathname: string = '') {
  if (process.env.NODE_ENV !== 'development') {
    return SERVER_BASE_URL;
  }

  // client-server rendering when in dev, since we don't have a public host for dev yet
  if (process.env.NODE_ENV === 'development' && typeof window === 'undefined') {
    // This would be the docker container address of the server
    return SERVER_INTERNAL_ADDRESS;
  }

  const clientAddress = new URL(window.location.href);
  const serverAddress = new URL(SERVER_BASE_URL);

  /** We use `clientAddress.origin` because in dev we could test over wifi across
   * devices. This ensures requests to server are also made using the server IP address on the
   * network rather than a localhost or some other host not publicly available.
   */
  const serverBaseUrl = new URL(pathname, clientAddress.origin);
  serverBaseUrl.port = serverAddress.port;

  return serverBaseUrl.toString();
}

export const getSocketURL = (pathname: string, base = getServerBaseURL()) => {
  const url = new URL(pathname, base);
  url.protocol = base.startsWith('https:') ? 'wss:' : 'ws:';
  return url;
};

function getAccessToken() {
  const token = getAccessTokenFromRegistry();

  if (!token) return Promise.resolve('');

  return Promise.resolve(token);
}

export const configuration = new Configuration({
  basePath: getServerBaseURL(SERVER_BASE_PATH),
  accessToken: getAccessToken,
});
