'use client';

import { useEffect } from 'react';

import { FormControl, Input, InputGroup, VStack } from '@/chakra-ui/react';

import { signIn } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import { SubmitHandler, useForm } from 'react-hook-form';

import { classValidatorResolver } from '@hookform/resolvers/class-validator';

import { AppleButton, GoogleButton, PrimaryButton } from '@/core/components/Button';
import { InputErrorMessage } from '@/core/components/InputErrorMessage';
import { InputLabel } from '@/core/components/InputLabel';
import { PasswordInput } from '@/core/components/Input';
import { AuthForm } from '@/core/composition/AuthLayout';
import { SigninCredentials, useAuthenticateAccountService } from '@/core/services/account';
import { resetAuthIntent, setAuthIntent } from '@/core/services/next-auth';
import { Routes } from '@/core/utils/routes';

export const SigninForm = () => {
  const searchParams = useSearchParams();
  const { register, handleSubmit, formState } = useForm<SigninCredentials>({
    resolver: classValidatorResolver(SigninCredentials),
  });

  const { errors } = formState;

  const signinHandler = useAuthenticateAccountService();

  const signin: SubmitHandler<SigninCredentials> = async (data) => {
    const defaultAddressToReturnTo = Routes.CONVERSATIONS_NEW;
    const addressToReturnTo = searchParams.get('callbackUrl') || defaultAddressToReturnTo;
    await signIn('credentials', {
      email: data.email,
      password: data.password,
      callbackUrl: addressToReturnTo,
      redirect: true,
    });
  };

  useEffect(() => {
    setAuthIntent('access');
    return () => resetAuthIntent();
  }, []);

  const borderRadius = { md: '2xl' };

  return (
    <AuthForm type="signin" title="Sign in to your account" onSubmit={handleSubmit(signin)}>
      <VStack mb={8} spacing={6} width="full" borderRadius={borderRadius}>
        <GoogleButton type="button" width="full" onClick={() => signIn('google')}>
          Sign in with Google
        </GoogleButton>
        <AppleButton type="button" width="full" onClick={() => signIn('apple')}>
          Sign in with Apple
        </AppleButton>
      </VStack>

      <VStack spacing={6} width="full" alignItems="flex-start" justifyContent="flex-start">
        <FormControl variant="floating" isInvalid={Boolean(errors.email)}>
          <InputGroup size="lg">
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

        <PrimaryButton width="full" type="submit" isLoading={signinHandler.isLoading}>
          Sign in
        </PrimaryButton>
      </VStack>
    </AuthForm>
  );
};
