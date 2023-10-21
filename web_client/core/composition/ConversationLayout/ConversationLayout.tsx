'use client';

import { ReactNode, useContext } from 'react';

import { Box, Flex, VStack } from '@/chakra-ui/react';

import { useParams } from 'next/navigation';
import { ErrorBoundary } from 'react-error-boundary';

import { AppBar } from '@/core/components/AppBar';
import { ProfileMenu } from '@/core/components/ProfileMenu';
import { ConfigContext } from '@/core/components/Providers';
import { backdropFactory } from '@/core/theme';
import { APP_BAR_HEIGHT } from '@/core/utils';

import { ConversationContextProvider } from '../Conversation';
import { useFallbackUI } from '../ErrorStates';
import { useAppSession, useThemeConstants } from '../hooks';
import { ConversationBar } from './ConversationBar';
import { ConversationCustomizer } from './ConversationCustomizer';
import { SplashScreen } from '@/core/components/Loader';

export interface ChatLayoutProps {
  children?: ReactNode;
}

export const ConversationLayout = ({ children }: ChatLayoutProps) => {
  const params = useParams();
  const session = useAppSession({ required: true });
  const { config } = useContext(ConfigContext);
  const { blended_bg } = useThemeConstants();

  const FallbackUI = useFallbackUI({
    width: 700,
    marginInline: 'auto',
    ...backdropFactory({ bgColor: blended_bg }),
  });

  const app_name = config.application_config.name;

  if (session.status !== 'authenticated') return <SplashScreen title={app_name} />;

  const name = session.data.user.name;
  const image = session.data.user.image;

  return (
    <Box height="full" bg="var(--root-bg)">
      <ConversationContextProvider>
        <AppBar type="tool" title={app_name} />

        <Flex height={`calc(100% - ${APP_BAR_HEIGHT}px)`} width="full">
          <VStack
            px={6}
            pb={8}
            spacing={4}
            flexShrink={1}
            alignSelf="flex-end"
            height="full"
            width={{ base: 'auto', lg: 300 }}
            display={{ base: 'none', lg: 'flex' }}
          >
            <ConversationBar activeConversationId={params.id.toString()} flex="1 1 auto" />

            <ProfileMenu name={name} image={image} />
          </VStack>

          <Flex
            px={6}
            mx="auto"
            justifyContent="center"
            height="full"
            width={{ base: 'full', md: '48em', lg: '40em', '2xl': '48em' }} // md: 768, lg: 640, 2xl: 768
          >
            <ErrorBoundary fallbackRender={FallbackUI}>{children}</ErrorBoundary>
          </Flex>

          <Box px={6} pb={8} width={{ base: 'auto', xl: 250, '2xl': 300 }} display={{ base: 'none', xl: 'flex' }}>
            <ConversationCustomizer />
          </Box>
        </Flex>
      </ConversationContextProvider>
    </Box>
  );
};
