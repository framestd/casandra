'use client';

import { Fragment, ReactNode, useContext, useEffect, useRef, useState } from 'react';

import { Box, Flex, VStack } from '@/chakra-ui/react';

import { useParams } from 'next/navigation';
import { ErrorBoundary } from 'react-error-boundary';

import { AppBar } from '@/core/components/AppBar';
import { SplashScreen } from '@/core/components/Loader';
import { ProfileMenu } from '@/core/components/ProfileMenu';
import { ConfigContext } from '@/core/components/Providers';
import { GoogleAPIsLoader } from '@/core/composition/GoogleAPIs';
import { backdropFactory } from '@/core/theme';

import { ConversationContextProvider } from '../Conversation';
import { useFallbackUI } from '../ErrorStates';
import { useAppSession, useThemeConstants } from '../hooks';
import { ConversationBar } from './ConversationBar';
import { ConversationCustomizer } from './ConversationCustomizer';

export interface ChatLayoutProps {
  children?: ReactNode;
}

export const ConversationLayout = ({ children }: ChatLayoutProps) => {
  const params = useParams();
  const session = useAppSession({ required: true });
  const appBarRef = useRef<HTMLDivElement>(null);
  const { config } = useContext(ConfigContext);
  const { blended_bg } = useThemeConstants();
  const [appBarRect, setAppBarRect] = useState<DOMRect | null>(null);

  const FallbackUI = useFallbackUI({
    width: 700,
    marginInline: 'auto',
    ...backdropFactory({ bgColor: blended_bg }),
  });

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const appBar = appBarRef.current;
      if (!appBar) return;
      setAppBarRect(appBar.getBoundingClientRect());
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  const app_name = config.application_config.name;

  if (session.status !== 'authenticated') return <SplashScreen title={app_name} />;

  const name = session.data.user.name;
  const image = session.data.user.image;

  return (
    <Fragment>
      <GoogleAPIsLoader apis={['gapi', 'gis']} />

      <Box height="full" bg="var(--root-bg)">
        <ConversationContextProvider>
          <Box p={{ lg: 2 }} ref={appBarRef}>
            <AppBar type="tool" title={app_name} borderRadius={{ lg: '2xl' }} />
          </Box>

          <Flex height={`calc(100% - ${appBarRect?.height ?? 0}px)`} width="full">
            <VStack
              px={2}
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
              mx="auto"
              justifyContent="center"
              height="full"
              width={{ base: 'full', md: '48em', lg: '40em', '2xl': '48em' }} // md: 768, lg: 640, 2xl: 768
            >
              <ErrorBoundary fallbackRender={FallbackUI}>{children}</ErrorBoundary>
            </Flex>

            <Box px={2} pb={8} width={{ base: 'auto', xl: 300 }} display={{ base: 'none', xl: 'flex' }}>
              <ConversationCustomizer />
            </Box>
          </Flex>
        </ConversationContextProvider>
      </Box>
    </Fragment>
  );
};
