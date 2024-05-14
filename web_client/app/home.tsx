import { ReactNode } from 'react';

import { Link } from '@/chakra-ui/next-js';
import { Box, VStack } from '@/chakra-ui/react';

import { Session } from 'next-auth';

import { AppDescription, AppName } from '@/core/components/AppBar';
import { PrimaryButton } from '@/core/components/Button';
import { styles } from '@/core/components/Loader';
import { Routes } from '@/core/utils/routes';

export interface HomeScaffoldProps {
  children?: ReactNode;
  appName?: string;
  appDesc?: string;
  session: Session | null;
}

export const HomeScaffold = ({ children, appName, appDesc, session }: HomeScaffoldProps) => {
  const hasSession = session && session.user;

  return (
    <Box height="full" bg="var(--root-bg)">
      <Box className={styles.main}>
        <Box className={styles.center}>
          <AppName textStyle="h2" name={appName} />

          <AppDescription description={appDesc} />
        </Box>

        <VStack width="full" spacing={6}>
          <PrimaryButton
            as={Link}
            href={hasSession ? Routes.CONVERSATIONS_NEW : Routes.SIGNIN}
            borderRadius="lg"
            width={300}
          >
            {hasSession ? 'Start a Conversation' : 'Sign in to Continue'}
          </PrimaryButton>

          {!hasSession && (
            <Link href={Routes.SIGNUP} colorScheme="brand" color="brand.500">
              or create an account
            </Link>
          )}
        </VStack>

        <Box className={styles.grid}>{children}</Box>
      </Box>
    </Box>
  );
};
