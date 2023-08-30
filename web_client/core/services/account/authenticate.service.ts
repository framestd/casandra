import { accountClient } from './client';
import { SigninCredentials } from './dto';

import { api } from '../base';

export async function reauthenticateAccountService(refreshToken: string) {
  const authenticateAccount = await accountClient.authenticateUserAccountAccountsAuthenticatePost(
    'username', // not necessary but API requires it
    'refresh_token',
    undefined,
    refreshToken,
  );

  const response = await authenticateAccount(api);

  return response;
}

export async function authenticateAccountService(signin: SigninCredentials) {
  const authenticateAccount = await accountClient.authenticateUserAccountAccountsAuthenticatePost(
    signin.email,
    'password',
    signin.password,
  );

  const response = await authenticateAccount(api);

  return response;
}
