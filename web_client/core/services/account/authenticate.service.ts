import { AccountCredentialsOIDC } from '@/client';
import { accountClient } from './client';
import { SigninCredentials } from './dto';

export async function reauthenticateAccountService(refreshToken: string) {
  const response = await accountClient.authenticateUserAccountAccountsAuthenticatePost({
    username: 'username', // not necessary but API requires it
    grantType: 'refresh_token',
    refreshToken,
  });

  return response;
}

export async function authenticateAccountService(credentials: SigninCredentials) {
  const response = await accountClient.authenticateUserAccountAccountsAuthenticatePost({
    username: credentials.email,
    grantType: 'password',
    password: credentials.password,
  });

  return response;
}

export async function authenticateAccountOIDCService(credentials: AccountCredentialsOIDC) {
  const response = await accountClient.authenticateUserAccountOidcAccountsAuthenticateOidcPost({
    accountCredentialsOIDC: credentials,
  });

  return response;
}
