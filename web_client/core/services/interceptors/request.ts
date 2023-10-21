import { AxiosError, AxiosRequestConfig } from 'axios';
import { MissingAccessTokenException } from '../config';

type RequestInterceptor = <R extends AxiosRequestConfig = AxiosRequestConfig>(r: R) => R | Promise<R>;
type RequestErrorInterceptor = (e: AxiosError) => Promise<AxiosRequestConfig>;

export const createRequestInterceptor = () => {
  const requestInterceptor: RequestInterceptor = async (config) => {
    if (config.headers && config.headers.Authorization) {
      const auth = config.headers.Authorization as string;
      const [type, token] = auth.split(/\s+/);
      if (type.toLowerCase() === 'bearer' && (!token || token.trim() === ''))
        throw new MissingAccessTokenException('No access token');
    }
    return config;
  };
  return requestInterceptor;
};

export const createRequestErrorInterceptor = () => {
  const errorInterceptor: RequestErrorInterceptor = async (err) => {
    console.error('Request Error: ', err.name, err);

    return Promise.reject(err);
  };
  return errorInterceptor;
};
