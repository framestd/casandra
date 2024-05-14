import axios from 'axios';

import {
  createRequestErrorInterceptor,
  createRequestInterceptor,
  createResponseErrorInterceptor,
  createResponseInterceptor,
} from './interceptors';

export const api = axios.create({ withCredentials: true });

const interceptedRequest = api.interceptors.request;
const interceptedResponse = api.interceptors.response;

const requestInterceptor = createRequestInterceptor();
const responseInterceptor = createResponseInterceptor();
const requestErrorInterceptor = createRequestErrorInterceptor();
const responseErrorInteceptor = createResponseErrorInterceptor(api);

interceptedRequest.use(requestInterceptor, requestErrorInterceptor);
interceptedResponse.use(responseInterceptor, responseErrorInteceptor);
