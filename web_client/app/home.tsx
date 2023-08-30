'use client';

import { Link } from '@/chakra-ui/next-js';
import { Box, VStack } from '@/chakra-ui/react';

import { AppDescription, AppName } from '@/core/components/AppBar';
import { PrimaryButton } from '@/core/components/Button';
import { styles } from '@/core/components/Loader';
import { ConfigContext } from '@/core/components/Providers';

import { ReactNode, useContext } from 'react';

export interface HomeScaffoldProps {
  children?: ReactNode;
  appName?: string;
  appDesc?: string;
}

export const HomeScaffold = ({ children, appName, appDesc }: HomeScaffoldProps) => {
  const { config } = useContext(ConfigContext);
  const hasSession = config.has_active_session;

  return (
    <Box css={styles.main}>
      <Box css={styles.center}>
        <AppName textStyle="h2" name={appName} />

        <AppDescription description={appDesc} />
      </Box>

      <VStack width="full" spacing={6}>
        <PrimaryButton as={Link} href={hasSession ? '/chat' : '/signin'} borderRadius="lg" width={300}>
          {hasSession ? 'Start a Conversation' : 'Sign in to Continue'}
        </PrimaryButton>

        {!hasSession && (
          <Link href="/signup" colorScheme="brand" color="brand.500">
            or create an account
          </Link>
        )}
      </VStack>

      <Box css={styles.grid}>{children}</Box>
    </Box>
  );
};
