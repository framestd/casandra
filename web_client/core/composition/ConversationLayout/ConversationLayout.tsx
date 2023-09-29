'use client';

import { ReactNode, useContext } from 'react';

import { Box, Flex, VStack } from '@/chakra-ui/react';

import { useParams } from 'next/navigation';
import { ErrorBoundary } from 'react-error-boundary';

import { AppBar } from '@/core/components/AppBar';
import { ProfileMenu } from '@/core/components/ProfileMenu';
import { ConfigContext } from '@/core/components/Providers';
import { backdropFactory } from '@/core/theme';
import { APP_BAR_HEIGHT, fullname } from '@/core/utils';

import { useFallbackUI } from '../ErrorStates';
import { useThemeConstants } from '../hooks';
import { ConversationBar } from './ConversationBar';

export interface ChatLayoutProps {
  children?: ReactNode;
}

export const ConversationLayout = ({ children }: ChatLayoutProps) => {
  const params = useParams();
  const { config } = useContext(ConfigContext);
  const user = config.session.user_account?.user;
  const name = user ? fullname(user) : '';

  const { blended_bg } = useThemeConstants();

  const FallbackUI = useFallbackUI({
    width: 700,
    marginInline: 'auto',
    ...backdropFactory({ bgColor: blended_bg }),
  });

  return (
    <Box height="full">
      <AppBar type="tool" title={config.application_config.name} />

      <Flex height={`calc(100% - ${APP_BAR_HEIGHT}px)`} width="full">
        <VStack
          px={6}
          pb={8}
          spacing={4}
          flexShrink={0}
          alignSelf="flex-end"
          height="full"
          width={{ base: 'auto', lg: 300 }}
          display={{ base: 'none', lg: 'flex' }}
        >
          <ConversationBar activeConversationId={params.id.toString()} flex="1 1 auto" />

          <ProfileMenu name={name} />
        </VStack>

        <Box height="full" width="full" px={6}>
          <ErrorBoundary fallbackRender={FallbackUI}>{children}</ErrorBoundary>
        </Box>
      </Flex>
    </Box>
  );
};
