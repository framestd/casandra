import { ReactNode, useContext } from 'react';

import { Box, Flex, VStack } from '@/chakra-ui/react';

import { useParams } from 'next/navigation';

import { AppBar } from '@/core/components/AppBar';
import { ProfileMenu } from '@/core/components/ProfileMenu';
import { ConfigContext } from '@/core/components/Providers';
import { APP_BAR_HEIGHT } from '@/core/utils';

import { ConversationBar } from './ConversationBar';

export interface ChatLayoutProps {
  name: string;
  children?: ReactNode;
}

export const ConversationLayout = ({ children, name }: ChatLayoutProps) => {
  const params = useParams();
  const { config } = useContext(ConfigContext);

  return (
    <Box height="full" bgRepeat="no-repeat" bgSize="cover">
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
          {/* TODO: Create and render error component */}

          <ConversationBar activeConversationId={params.id.toString()} pt={8} flex="1 1 auto" />

          <ProfileMenu name={name} />
        </VStack>

        <Box height="full" width="full">
          {children}
        </Box>
      </Flex>
    </Box>
  );
};
