import { Flex, FlexProps } from '@/chakra-ui/react';
import { AppBar } from '@/core/components/AppBar';
import { ReactNode } from 'react';

export interface AuthLayoutProps extends FlexProps {
  children: ReactNode;
}

export const AuthLayout = ({ children }: AuthLayoutProps) => {
  return (
    <Flex height="full" justifyContent="flex-start" alignItems="center" flexDirection="column">
      <AppBar />

      <Flex height="full" width="full" justifyContent="center" alignItems="center">
        {children}
      </Flex>
    </Flex>
  );
};
