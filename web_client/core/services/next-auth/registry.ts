import { Token } from '@/client/api';

class TokenRegistry {
  private token: Token | null = null;

  clear() {
    this.token = null;
  }

  register(token: Token) {
    this.token = token;
  }

  collect() {
    return this.token;
  }
}

export const tokenRegistry = new TokenRegistry();

export const getTokens = () => tokenRegistry.collect();
export const clearTokens = () => tokenRegistry.clear();

export const getAccessToken = () => {
  const accessToken = tokenRegistry.collect()?.access_token;
  return accessToken ? accessToken + '' : undefined;
};

export const getRefreshToken = () => {
  const refreshToken = tokenRegistry.collect()?.refresh_token;
  return refreshToken ? refreshToken + '' : undefined;
};
