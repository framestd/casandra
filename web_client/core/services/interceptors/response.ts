import { AxiosError, AxiosInstance, AxiosResponse } from 'axios';

import { ErrorCode } from '@/client';
import { getAuthorization } from '@/core/utils';
import { Routes } from '@/core/utils/routes';

import { appEventAdapter } from '../events';
import { getRefreshToken } from '../next-auth/registry';
import { ErrorPayload } from '../types';
import { isErrorResponse } from '../utils';

type RemoteResponse = AxiosResponse<any>;
type ResponseInterceptor = <R extends RemoteResponse = RemoteResponse>(r: R) => R | Promise<R>;

type RemoteError = AxiosError<ErrorPayload>;
type ResponseErrorInterceptor = <E extends RemoteError = RemoteError>(e: E) => Promise<E | AxiosResponse>;

export const createResponseInterceptor = () => {
  const interceptor: ResponseInterceptor = async (res) => {
    if (isErrorResponse(res.data)) {
      return Promise.reject(res.data);
    }

    return res;
  };

  return interceptor;
};

export const createResponseErrorInterceptor = (api: AxiosInstance) => {
  const errorInterceptor: ResponseErrorInterceptor = async (err) => {
    const { reauthenticateAccountService } = await import('../account/authenticate.service');
    const error = err.response?.data;
    const requestData: Record<string, any> | undefined = err.config?.data;
    const isReauthenticationError =
      /\/accounts\/authenticate\/?/.test(err.config?.url || '') &&
      requestData !== undefined &&
      !!requestData.refresh_token;

    const rejection = () => Promise.reject(error || err);

    const logout = <R = never>(result: () => Promise<R> = rejection) => {
      const allowedRoutes = new Set<string>([Routes.SIGNIN, Routes.SIGNUP]);
      appEventAdapter.trigger('signout');

      // Reload: <PrivateRoute /> should redirect to login page after reload if the page is one that requires a session
      if (typeof window !== 'undefined' && !allowedRoutes.has(window.location.pathname)) {
        window.location.reload();
      }

      return result();
    };

    if (isReauthenticationError) {
      return logout();
    }

    if (error && error.code === ErrorCode.UNAUTHORIZED) {
      const refresh_token = getRefreshToken();

      if (!refresh_token) {
        return logout();
      }

      let response: Awaited<ReturnType<typeof reauthenticateAccountService>>;

      try {
        response = await reauthenticateAccountService(refresh_token);
      } catch (e) {
        return logout();
      }

      // trigger a session update for listeners one of which is the nextAuthSession.update listener in SessionLoader
      appEventAdapter.trigger('tokenrefresh', response.data);

      const newConfig = {
        ...err.config,
        headers: { ...err.config!.headers, authorization: getAuthorization(response.data) },
      };

      const retry = await api(newConfig);
      return retry;
    }

    return rejection();
  };
  return errorInterceptor;
};
