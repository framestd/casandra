'use client';

import { useContext, useEffect } from 'react';

import { FormControl, HStack, Input, InputGroup, VStack } from '@/chakra-ui/react';

import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { SubmitHandler, useForm } from 'react-hook-form';

import { classValidatorResolver } from '@hookform/resolvers/class-validator';

import { toast } from '@/core/components/AppToast';
import { AppleButton, GoogleButton, PrimaryButton } from '@/core/components/Button';
import { InputErrorMessage } from '@/core/components/InputErrorMessage';
import { InputLabel } from '@/core/components/InputLabel';
import { PasswordInput } from '@/core/components/Input';
import { actions, ConfigContext } from '@/core/components/Providers';
import { AuthForm } from '@/core/composition/AuthLayout';
import { SignupCredentials, useAuthenticateAccountService, useCreateAccountService } from '@/core/services/account';
import { resetAuthIntent, setAuthIntent } from '@/core/services/next-auth';
import { REFRESH_TOKEN_KEY, addTokenToStorage } from '@/core/utils';
import { Routes } from '@/core/utils/routes';

export const SignupForm = () => {
  const router = useRouter();
  const { updateConfig } = useContext(ConfigContext);
  const { register, handleSubmit, formState } = useForm<SignupCredentials>({
    resolver: classValidatorResolver(SignupCredentials),
  });

  const { errors } = formState;

  const signupHandler = useCreateAccountService();
  const signinHandler = useAuthenticateAccountService();

  const signup: SubmitHandler<SignupCredentials> = async (data) => {
    const { data: account } = await signupHandler.mutateAsync(data);
    const response = await signinHandler.mutateAsync({ email: data.email, password: data.password });

    addTokenToStorage(response.data.access_token + '');
    addTokenToStorage(response.data.refresh_token + '', REFRESH_TOKEN_KEY);

    updateConfig(actions.createHasActiveSessionUpdateAction(true));
    updateConfig(actions.createUserAccountUpdateAction(account.data));

    toast.success({ title: 'Account Created', message: `You just successfully created an account!` });

    // TODO: change 'new' to user's most recent conversation's id
    router.replace(Routes.CONVERSATIONS_NEW);
  };

  useEffect(() => {
    setAuthIntent('register');
    return () => resetAuthIntent();
  }, []);

  return (
    <AuthForm type="signup" title="Create your account" onSubmit={handleSubmit(signup)}>
      <VStack mb={8} spacing={6} width="full">
        <GoogleButton type="button" width="full" onClick={() => signIn('google')}>
          Sign up with Google
        </GoogleButton>

        <AppleButton type="button" width="full" onClick={() => signIn('apple')}>
          Sign up with Apple
        </AppleButton>
      </VStack>

      <VStack spacing={8} justifyContent="flex-start" alignItems="flex-start">
        <HStack spacing={4} width="full">
          <FormControl variant="floating" isInvalid={Boolean(errors.first_name)}>
            <InputGroup>
              <Input size="lg" placeholder=" " fontSize="sm" {...register('first_name')} />
            </InputGroup>

            <InputLabel>First name</InputLabel>

            <InputErrorMessage message={errors.first_name?.message} />
          </FormControl>

          <FormControl variant="floating" isInvalid={Boolean(errors.last_name)}>
            <InputGroup>
              <Input size="lg" placeholder=" " fontSize="sm" {...register('last_name')} />
            </InputGroup>

            <InputLabel>Last name</InputLabel>

            <InputErrorMessage message={errors.last_name?.message} />
          </FormControl>
        </HStack>

        <FormControl variant="floating" isInvalid={Boolean(errors.username)}>
          <InputGroup>
            <Input size="lg" placeholder=" " fontSize="sm" {...register('username')} />
          </InputGroup>

          <InputLabel>Username</InputLabel>

          <InputErrorMessage message={errors.username?.message} />
        </FormControl>

        <FormControl variant="floating" isInvalid={Boolean(errors.email)}>
          <InputGroup>
            <Input size="lg" placeholder=" " fontSize="sm" {...register('email')} />
          </InputGroup>

          <InputLabel>Email address</InputLabel>

          <InputErrorMessage message={errors.email?.message} />
        </FormControl>

        <FormControl variant="floating" isInvalid={Boolean(errors.password)}>
          <PasswordInput size="lg" placeholder=" " fontSize="sm" {...register('password')} />

          <InputLabel>Password</InputLabel>

          <InputErrorMessage message={errors.password?.message} />
        </FormControl>

        <PrimaryButton width="full" type="submit" isLoading={signupHandler.isLoading || signinHandler.isLoading}>
          Create account
        </PrimaryButton>
      </VStack>
    </AuthForm>
  );
};
