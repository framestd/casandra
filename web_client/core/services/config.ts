import { Configuration } from '@/client/configuration';

import { SERVER_BASE_URL, SERVER_INTERNAL_ADDRESS } from '../utils';
import { getAccessToken as getAccessTokenFromRegistry } from './next-auth/registry';

export class MissingAccessTokenException extends Error {
  name = MissingAccessTokenException.name;
}

export function getServerBaseURL() {
  // in production
  if (process.env.NODE_ENV !== 'development') return SERVER_BASE_URL;

  // on server
  if (process.env.NODE_ENV === 'development' && typeof window === 'undefined') return SERVER_INTERNAL_ADDRESS;

  const clientAddress = new URL(window.location.href);
  const serverAddress = new URL(SERVER_BASE_URL);

  const serverBaseUrl = `${clientAddress.protocol}//${clientAddress.hostname}:${serverAddress.port}`;

  return serverBaseUrl;
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

export const configuration = new Configuration({ basePath: getServerBaseURL(), accessToken: getAccessToken });
