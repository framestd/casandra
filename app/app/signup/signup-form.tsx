'use client';

import { Link } from '@/chakra-ui/next-js';
import { FormControl, HStack, Input, InputGroup, VStack } from '@/chakra-ui/react';

import { toast } from '@/core/components/AppToast';
import { PrimaryButton } from '@/core/components/Button';
import { Form } from '@/core/components/Form';
import { InputErrorMessage } from '@/core/components/InputErrorMessage';
import { InputLabel } from '@/core/components/InputLabel';
import { PasswordInput } from '@/core/components/PasswordInput';
import { ConfigContext, actions } from '@/core/components/Providers';
import { Typography } from '@/core/components/Typography';
import { SignupCredentials } from '@/core/services';
import { useAuthenticateAccountService, useCreateAccountService } from '@/core/services/account';
import { REFRESH_TOKEN_KEY, storeToken } from '@/core/utils';

import { classValidatorResolver } from '@hookform/resolvers/class-validator';
import { useRouter } from 'next/navigation';
import { SubmitHandler, useForm } from 'react-hook-form';
import { useContext } from 'react';

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

    storeToken(response.data.access_token);
    storeToken(response.data.refresh_token, REFRESH_TOKEN_KEY);

    updateConfig(actions.createHasActiveSessionUpdateAction(true));
    updateConfig(actions.createUserAccountUpdateAction(account));

    toast.success({ title: 'Account Created', message: `You just successfully created an account!` });

    router.replace('/chat');
  };

  return (
    <Form
      px={{ base: 6, md: 16, xl: 32 }}
      py={{ base: 16, xl: 32 }}
      maxWidth="full"
      borderRadius={{ md: '2xl' }}
      width={{ base: 'full', md: 480, lg: 675 }}
      bgColor="whiteAlpha.100"
      onSubmit={handleSubmit(signup)}
    >
      <Typography mb={10} textStyle="h4" textAlign="center">
        Create your account
      </Typography>

      <VStack spacing={8} justifyContent="flex-start" alignItems="flex-start">
        <HStack spacing={4} width="full">
          <FormControl variant="floating" isInvalid={Boolean(errors.first_name)}>
            <InputGroup>
              <Input placeholder=" " fontSize="sm" {...register('first_name')} />
            </InputGroup>

            <InputLabel>First name</InputLabel>

            <InputErrorMessage message={errors.first_name?.message} />
          </FormControl>

          <FormControl variant="floating" isInvalid={Boolean(errors.last_name)}>
            <InputGroup>
              <Input placeholder=" " fontSize="sm" {...register('last_name')} />
            </InputGroup>

            <InputLabel>Last name</InputLabel>

            <InputErrorMessage message={errors.last_name?.message} />
          </FormControl>
        </HStack>

        <FormControl variant="floating" isInvalid={Boolean(errors.username)}>
          <InputGroup>
            <Input placeholder=" " fontSize="sm" {...register('username')} />
          </InputGroup>

          <InputLabel>Username</InputLabel>

          <InputErrorMessage message={errors.username?.message} />
        </FormControl>

        <FormControl variant="floating" isInvalid={Boolean(errors.email)}>
          <InputGroup>
            <Input placeholder=" " fontSize="sm" {...register('email')} />
          </InputGroup>

          <InputLabel>Email address</InputLabel>

          <InputErrorMessage message={errors.email?.message} />
        </FormControl>

        <FormControl variant="floating" isInvalid={Boolean(errors.password)}>
          <PasswordInput placeholder=" " fontSize="sm" {...register('password')} />

          <InputLabel>Password</InputLabel>

          <InputErrorMessage message={errors.password?.message} />
        </FormControl>

        <PrimaryButton width="full" type="submit" isLoading={signupHandler.isLoading || signinHandler.isLoading}>
          Create account
        </PrimaryButton>
      </VStack>

      <VStack mt={4} alignItems="center">
        <Link color="brand.500" fontSize="sm" href="/signin">
          Sign in to your account
        </Link>
      </VStack>
    </Form>
  );
};
