'use client';

import { Box, useColorModeValue } from '@/chakra-ui/react';
import { ChatBox } from '@/core/components/ChatBox';
import {
  useConversationMessageSocket,
  usePublishMessageService,
  useReadMessagesByConversationIdService,
} from '@/core/services/message';
import { CONVERSATIONS } from '@/core/utils/routes';
import { useRouter } from 'next/navigation';
import { useCallback, useContext, useMemo } from 'react';
import { usePagedNormalizerFn } from '../hooks';
import { ConfigContext } from '@/core/components/Providers';
import { ChatTextBox } from '@/core/components/ChatTextBox';
import { ConversationMessageList } from './ConversationMessageList';

export interface ConversationProps {
  conversation_id: string;
}

export const Conversation = ({ conversation_id }: ConversationProps) => {
  const router = useRouter();
  const textboxBgColor = useColorModeValue('blackAlpha.100', 'whiteAlpha.100');

  const { config } = useContext(ConfigContext);
  const { data, isSuccess, isLoading } = useReadMessagesByConversationIdService(conversation_id, {
    trigger: conversation_id !== 'new',
    variables: { sort: ['updated_at:asc'] },
    select: (data) => {
      return { ...data, pages: data.pages.map((page) => page.data) };
    },
  });

  const pagedNormalizer = usePagedNormalizerFn();
  const publishMessageHandler = usePublishMessageService();
  const messages = useMemo(
    () => (!isSuccess || isLoading ? [] : pagedNormalizer(data.pages)),
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

  if (!user) return null;

  return (
    <ChatBox justifyContent="center" alignItems="flex-end" flexDirection="column" overflow="hidden">
      <ConversationMessageList messages={messages} user={user} />

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
