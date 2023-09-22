'use client';

import { useCallback, useContext, useId, useMemo } from 'react';

import { Box, Flex, useColorModeValue } from '@/chakra-ui/react';

import { useRouter } from 'next/navigation';
import InfiniteScroll from 'react-infinite-scroll-component';

import { ChatBox } from '@/core/components/ChatBox';
import { ChatTextBox } from '@/core/components/ChatTextBox';
import { ConfigContext } from '@/core/components/Providers';
import {
  useConversationMessageSocket,
  usePublishMessageService,
  useReadMessagesByConversationIdService,
} from '@/core/services/message';
import { CONVERSATIONS } from '@/core/utils/routes';

import { usePagedNormalizerFn } from '../hooks';
import { ConversationMessageList } from './ConversationMessageList';

export interface ConversationProps {
  conversation_id: string;
}

export const Conversation = ({ conversation_id }: ConversationProps) => {
  const router = useRouter();
  const textboxBgColor = useColorModeValue('blackAlpha.100', 'whiteAlpha.100');

  const { config } = useContext(ConfigContext);
  const {
    data,
    isSuccess,
    isLoading,
    hasPreviousPage = false,
    fetchPreviousPage,
  } = useReadMessagesByConversationIdService(conversation_id, {
    trigger: conversation_id !== 'new',
    variables: { sort: ['created_at:desc'], pageSize: 8 },
    select: (data) => {
      return { ...data, pages: data.pages.map((page) => page.data) };
    },
  });

  const pagedNormalizer = usePagedNormalizerFn();
  const publishMessageHandler = usePublishMessageService();
  const messages = useMemo(
    () => (!isSuccess || isLoading ? [] : pagedNormalizer(data.pages.toReversed()).toReversed()),
    [data?.pages, isLoading, isSuccess, pagedNormalizer],
  );

  useConversationMessageSocket(conversation_id);

  const publishMessageToConversation = useCallback(
    async (conversation_id: string, message: string, router: ReturnType<typeof useRouter>) => {
      const outboundMessage = message.trim();

      if (conversation_id === 'new') {
        const response = await publishMessageHandler.mutateAsync({ body: '<noop>' });
        const data = response.data.data;

        router.replace(`${CONVERSATIONS}/${data.conversation_id}`);

        await publishMessageHandler.mutateAsync({ body: outboundMessage, conversation_id: data.conversation_id });
      }

      publishMessageHandler.mutateAsync({ body: outboundMessage, conversation_id });
    },
    [publishMessageHandler],
  );

  const user = config.session.user_account?.user;
  const scrollableTargetId = useId();

  if (!user) return null;

  return (
    <ChatBox justifyContent="center" alignItems="flex-end" flexDirection="column" overflow="hidden">
      <Flex id={scrollableTargetId} width="full" overflow="auto" marginBlockEnd="auto" flexDirection="column-reverse">
        <InfiniteScroll
          scrollableTarget={scrollableTargetId}
          dataLength={messages.length}
          hasMore={hasPreviousPage}
          next={() => fetchPreviousPage()}
          inverse={true}
          loader={null}
          style={{ display: 'flex', flexDirection: 'column-reverse' }}
        >
          <ConversationMessageList messages={messages} user={user} />
        </InfiniteScroll>
      </Flex>

      <Box px={3} width="full">
        <ChatTextBox
          my={8}
          bgColor={textboxBgColor}
          onSend={async (message) => await publishMessageToConversation(conversation_id, message, router)}
          isSending={publishMessageHandler.isLoading}
        />
      </Box>
    </ChatBox>
  );
};
