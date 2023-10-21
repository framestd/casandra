import { AccountCreateOIDC } from '@/client';
import { accountClient } from './client';
import { SignupCredentials } from './dto';

export async function createAccountService(signup: SignupCredentials) {
  const response = await accountClient.createUserAccountAccountsCreatePost({
    accountCreate: {
      email: signup.email,
      password: signup.password,
      user: {
        first_name: signup.first_name,
        last_name: signup.last_name,
        username: signup.username,
      },
    },
  });

  return response;
}

export async function createAccountOIDCService(credentials: AccountCreateOIDC) {
  const response = await accountClient.createUserAccountOidcAccountsCreateOidcPost({
    accountCreateOIDC: credentials,
  });

  return response;
}
