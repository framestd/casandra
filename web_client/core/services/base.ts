import axios from 'axios';

import {
  createRequestErrorInterceptor,
  createResponseErrorInterceptor,
  createResponseInterceptor,
} from './interceptors';
import { ErrorPayload } from './types';

export const api = axios.create({ withCredentials: true });

const interceptedRequest = api.interceptors.request;
const interceptedResponse = api.interceptors.response;

const responseInterceptor = createResponseInterceptor();
const requestErrorInterceptor = createRequestErrorInterceptor();
const responseErrorInteceptor = createResponseErrorInterceptor(api);

interceptedRequest.use(undefined, requestErrorInterceptor);
interceptedResponse.use(responseInterceptor, responseErrorInteceptor);

export function isErrorResponse(value: unknown): value is ErrorPayload {
  if (!value) return false;

  if (typeof value === 'object' && 'message' in value && 'error' in value && 'success' in value) {
    const err = value as ErrorPayload;

    return err.success === false;
  }

  return false;
}
