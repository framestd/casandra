import {
  InfiniteData,
  InfiniteQueryObserverOptions,
  QueryObserverOptions,
  UseMutationOptions,
} from '@tanstack/react-query';
import { AxiosError, AxiosResponse } from 'axios';

type Require<T, K extends keyof T> = { [P in K]-?: T[P] } & Pick<T, Exclude<keyof T, K>>;

export enum ErrorCodeEnum {
  // APP
  CHALLENGE_FAILED = 'CHALLENGE_FAILED',
  MISSING_RESOURCE = 'MISSING_RESOURCE',

  // HTTP
  CONFLICT = 'CONFLICT',
  FORBIDDEN_REQUEST = 'FORBIDDEN_REQUEST',
  INVALID_REQUEST = 'INVALID_REQUEST',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  UNAUTHORIZED = 'UNAUTHORIZED',
  UNKNOWN = 'UNKNOWN',
  UNPROCESSABLE_ENTITY = 'UNPROCESSABLE_ENTITY',
}

export interface ErrorPayload {
  message: string;
  success: false;
  error: { code: ErrorCodeEnum; [x: string]: any };
}

export type WithId<T> = T & { id: string };

export type ServiceOptions<RequestData, ResponseData, ErrorData = ErrorPayload, Context = unknown> = UseMutationOptions<
  AxiosResponse<ResponseData, any>,
  ErrorData,
  RequestData,
  Context
>;

interface IBaseQueryServiceOptions<R = any, V = unknown, S = unknown>
  extends Pick<
    QueryObserverOptions<AxiosResponse<R>, AxiosError<ErrorPayload> | ErrorPayload, S>,
    'onSuccess' | 'onError'
  > {
  trigger?: boolean;
  variables?: V;
  select?(data: AxiosResponse<R>): S;
}

export type BaseQueryServiceOptions<R = any, V = unknown, S = unknown> = V extends Record<string, any>
  ? Require<IBaseQueryServiceOptions<R, V, S>, 'variables'>
  : IBaseQueryServiceOptions<R, V, S>;

interface IBaseInfiniteQueryServiceOptions<R = any, V = unknown, S = unknown>
  extends Pick<
    InfiniteQueryObserverOptions<AxiosResponse<R>, AxiosError<ErrorPayload> | ErrorPayload, S>,
    'onSuccess' | 'onError'
  > {
  trigger?: boolean;
  variables?: V;
  select?(data: InfiniteData<AxiosResponse<R>>): InfiniteData<S>;
}

export type BaseInfiniteQueryServiceOptions<R = any, V = unknown, S = unknown> = V extends Record<string, any>
  ? Require<IBaseInfiniteQueryServiceOptions<R, V, S>, 'variables'>
  : IBaseInfiniteQueryServiceOptions<R, V, S>;
