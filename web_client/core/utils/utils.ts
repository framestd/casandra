import { ThemeTypings } from '@/chakra-ui/react';

import get from 'lodash.get';

import { Token } from '@/client/api';

import { theme } from '../theme';
import { Choose } from './types';

type UserPerson = { first_name: string; last_name: string };

export const APP_BAR_HEIGHT = 50;
export const USERNAME_REGEX = /^[A-Za-z]+(?:[_.]?[A-Za-z0-9]+)*$/;
export const ACCESS_TOKEN_KEY = 'access_token';
export const REFRESH_TOKEN_KEY = 'refresh_token';

export const getAuthorization = (token: Token | null) =>
  token ? `${token.token_type} ${token.access_token}` : undefined;

export const getThemeColor = <T = unknown, L extends Choose<ThemeTypings, 'colors'> = string>(label: L) => {
  const field = get(theme.colors, label);
  return field ? (field as T) : label;
};

export const addTokenToStorage = (token: string, key = ACCESS_TOKEN_KEY) => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(key, token);
};

export const getTokenFromStorage = (key = ACCESS_TOKEN_KEY) => {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(key);
};

export const removeTokenFromStorage = (key = ACCESS_TOKEN_KEY) => {
  if (typeof window === 'undefined') return;
  return localStorage.removeItem(key);
};

export const fullname = <U extends UserPerson>(user: U) => user.first_name.concat(' ', user.last_name);

export const isFunction = (v: any): v is (...args: any) => any => typeof v === 'function';

export const isURL = <T extends URL | string = URL | string>(v: any): v is T => {
  try {
    new URL(v);
    return true;
  } catch (_) {
    return false;
  }
};

export const uuidToHex = (uuid: string) => uuid.replace(/-/g, '');

export const never = (_: never) => {
  throw new Error(`Unhandled case: ${_}`);
};

export function range(start: number): Generator<number>;
export function range(start: number, end: number): Generator<number>;
export function range(start: number, end: number, step: number): Generator<number>;
export function range(start: number, end: number | undefined, step: number): Generator<number>;
export function* range(start: number, end?: number, step: number = 1) {
  if (end === undefined) [end, start] = [start, 0];

  for (let i = start; i < end; i += step) {
    yield i;
  }
}
