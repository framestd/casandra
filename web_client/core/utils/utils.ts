import { ThemeTypings } from '@/chakra-ui/react';

import get from 'lodash.get';

import { Choose } from './types';

import { theme } from '../theme';
import { User } from '@/client';

export const APP_BAR_HEIGHT = 50;
export const USERNAME_REGEX = /^[A-Za-z]+(?:[_.]?[A-Za-z0-9]+)*$/;
export const ACCESS_TOKEN_KEY = 'access_token';
export const REFRESH_TOKEN_KEY = 'refresh_token';

export const getThemeColor = <T = unknown, L extends Choose<ThemeTypings, 'colors'> = string>(label: L) => {
  const field = get(theme.colors, label);
  return field ? (field as T) : label;
};

export const storeToken = (token: string, key = ACCESS_TOKEN_KEY) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, token);
};

export const getToken = (key = ACCESS_TOKEN_KEY) => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(key);
};

export const removeToken = (key = ACCESS_TOKEN_KEY) => {
  if (typeof window === 'undefined') return;
  return localStorage.removeItem(key);
};

export const fullname = (user: User) => user.first_name.concat(' ', user.last_name);
