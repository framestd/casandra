import { accountClient } from './client';
import { SignupCredentials } from './dto';

import { api } from '../base';

export async function createAccountService(signup: SignupCredentials) {
  const createAccount = await accountClient.createUserAccountAccountsCreatePost({
    email: signup.email,
    password: signup.password,
    user: {
      first_name: signup.first_name,
      last_name: signup.last_name,
      username: signup.username,
    },
  });

  const response = await createAccount(api);

  return response;
}
