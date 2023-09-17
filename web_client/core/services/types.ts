import { AxiosError, AxiosResponse } from 'axios';

import {
  InfiniteData,
  InfiniteQueryObserverOptions,
  QueryObserverOptions,
  UseMutationOptions,
} from '@tanstack/react-query';

import { ErrorAttributes, ErrorCode } from '@/client';

type Require<T, K extends keyof T> = { [P in K]-?: T[P] } & Pick<T, Exclude<keyof T, K>>;

export interface ErrorPayload {
  message: string;
  success: false;
  error: { code: ErrorCode; errors: ErrorAttributes[] };
}

export interface BasePagedServiceParams {
  sort?: string[];
  pageCursor?: string;
  pageSize?: number;
  pageForward?: boolean;
}

export type WithId<T> = T & { id: string };

export type MutationServiceOptions<
  RequestData,
  ResponseData,
  ErrorData = ErrorPayload,
  Context = unknown,
> = UseMutationOptions<AxiosResponse<ResponseData, any>, ErrorData, RequestData, Context>;

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
