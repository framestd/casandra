'use client';

import { ComponentProps, ReactNode } from 'react';

import { Link } from '@/chakra-ui/next-js';
import { Box, ChakraProps, MergeWithAs, useColorModeValue } from '@/chakra-ui/react';

import { Form } from '@/core/components/Form';
import { Typography } from '@/core/components/Typography';

type Assign<T, U> = Omit<T, keyof U> & U;

type Props = { title: ReactNode; type: 'signin' | 'signup' };
export type AuthFormProps = MergeWithAs<
  ComponentProps<'form'>,
  ComponentProps<'form'>,
  Assign<ChakraProps, Props>,
  'form'
>;

export const AuthForm = ({ children, title, type, onSubmit, ...rest }: AuthFormProps) => {
  const bgOffScheme = useColorModeValue('offwhite', 'offblack');
  const px = { base: 6, md: 16, xl: 16 };
  const py = { base: 16, xl: 16 };
  const borderRadius = { md: '2xl' };

  return (
    <Form
      mx="auto"
      my="auto"
      display="flex"
      maxWidth="full"
      alignItems="center"
      flexDirection="column"
      justifyContent="center"
      borderRadius={borderRadius}
      width={{ base: 'full', md: 480, lg: 480 }}
      onSubmit={onSubmit}
      {...rest}
    >
      <Typography mb={8} textStyle="h4" textAlign="center">
        {title}
      </Typography>

      <Box px={px} py={py} width="inherit" bgColor={bgOffScheme} borderRadius={borderRadius}>
        {children}

        <Box mt={4} textAlign="center">
          <Link color="brand.500" fontSize="sm" href={type === 'signin' ? '/signup' : '/signin'}>
            {type === 'signin' ? 'Create an account' : 'Sign in to your account'}
          </Link>
        </Box>
      </Box>
    </Form>
  );
};
