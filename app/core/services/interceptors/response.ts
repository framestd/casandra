import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY, getToken, removeToken, storeToken } from '@/core/utils';
import { AxiosError, AxiosResponse, AxiosInstance } from 'axios';

import { reauthenticateAccountService } from '../account/authenticate.service';
import { ErrorCodeEnum, ErrorPayload } from '../types';

type RemoteResponse = AxiosResponse<any>;
type ResponseInterceptor = <R extends RemoteResponse = RemoteResponse>(r: R) => R | Promise<R>;

type RemoteError = AxiosError<ErrorPayload>;
type ResponseErrorInterceptor = <E extends RemoteError = RemoteError>(e: E) => Promise<E | AxiosResponse>;

export const createResponseInterceptor = () => {
  const interceptor: ResponseInterceptor = async (res) => {
    if (!res.data.data && !res.data.success) {
      return Promise.reject(res.data);
    }

    return res;
  };

  return interceptor;
};

export const createResponseErrorInterceptor = (api: AxiosInstance) => {
  const errorInterceptor: ResponseErrorInterceptor = async (err) => {
    const error = err.response?.data;
    const requestData = err.config?.data;
    const isReauthenticationError =
      /\/accounts\/authenticate\/?/.test(err.config?.url || '') &&
      requestData !== undefined &&
      !!requestData.refresh_token;

    const rejection = () => Promise.reject(error || err);

    const logout = <R = never>(result: () => Promise<R> = rejection) => {
      removeToken(ACCESS_TOKEN_KEY);
      removeToken(REFRESH_TOKEN_KEY);

      if (typeof window !== 'undefined') {
        window.location.reload();
      }

      return result();
    };

    if (isReauthenticationError) {
      return logout();
    }

    if (error && error.info.code === ErrorCodeEnum.UNAUTHORIZED) {
      const access_token = getToken(ACCESS_TOKEN_KEY);
      const refresh_token = getToken(REFRESH_TOKEN_KEY);

      if (!access_token || !refresh_token) {
        return logout();
      }

      let response: Awaited<ReturnType<typeof reauthenticateAccountService>>;

      try {
        response = await reauthenticateAccountService(refresh_token);
      } catch (e) {
        return logout();
      }

      const newAccessToken: string = response.data.access_token;
      const newRefreshToken: string = response.data.refresh_token;
      const newTokensType: string = response.data.token_type;

      if (!newAccessToken || !newRefreshToken) {
        return rejection();
      }

      storeToken(newAccessToken, ACCESS_TOKEN_KEY);
      storeToken(newRefreshToken, REFRESH_TOKEN_KEY);

      const authorization = `${newTokensType} ${newAccessToken}`;

      const newConfig = {
        ...err.config,
        headers: { ...err.config!.headers, authorization: authorization },
      };

      const retry = await api(newConfig);
      return retry;
    }

    return rejection();
  };
  return errorInterceptor;
};
