import { AxiosError, AxiosRequestConfig } from 'axios';

type RequestErrorInterceptor = (e: AxiosError) => Promise<AxiosRequestConfig>;

export const createRequestErrorInterceptor = () => {
  const errorInterceptor: RequestErrorInterceptor = async (err) => {
    console.error('Request Error: ', err.name, err);

    return Promise.reject(err);
  };
  return errorInterceptor;
};
