import { Configuration } from '@/client/configuration';

import { SERVER_BASE_URL, SERVER_INTERNAL_ADDRESS, getToken } from '../utils';

export class MissingAccessTokenException extends Error {
  name = MissingAccessTokenException.name;
}

function getServerBaseURL() {
  // in production
  if (process.env.NODE_ENV !== 'development') return SERVER_BASE_URL;

  // on server
  if (process.env.NODE_ENV === 'development' && typeof window === 'undefined') return SERVER_INTERNAL_ADDRESS;

  const clientAddress = new URL(window.location.href);
  const serverAddress = new URL(SERVER_BASE_URL);

  const serverBaseUrl = `${clientAddress.protocol}//${clientAddress.hostname}:${serverAddress.port}`;

  return serverBaseUrl;
}

function getAccessToken() {
  const token = getToken();

  if (!token) return Promise.reject(new MissingAccessTokenException('No access token!'));

  return Promise.resolve(token);
}

export const configuration = new Configuration({ basePath: getServerBaseURL(), accessToken: getAccessToken });
