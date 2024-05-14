import { ReactNode } from 'react';

import { Box, Flex, FlexProps } from '@/chakra-ui/react';

import { AppBar } from '@/core/components/AppBar';

export interface AuthLayoutProps extends FlexProps {
  children: ReactNode;
}

export const AuthLayout = ({ children }: AuthLayoutProps) => {
  return (
    <Box height="full" bg={{ xl: 'var(--root-bg)' }}>
      <Flex height="full" width="full" alignItems="center">
        <Box height="full" width="50%" bgColor="brand.600" display={{ base: 'none' }}>
          <AppBar type="basic" />
        </Box>
        <Box py={8} width="full">
          {children}
        </Box>
      </Flex>
    </Box>
  );
};
