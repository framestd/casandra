'use client';

import { useCallback, useContext, useEffect, useId, useMemo, useRef } from 'react';

import { Box, Flex, Portal, useColorModeValue, usePopper } from '@/chakra-ui/react';

import { useRouter } from 'next/navigation';
import InfiniteScroll from 'react-infinite-scroll-component';

import { ChatBox } from '@/core/components/ChatBox';
import { ChatTextBox } from '@/core/components/ChatTextBox';
import { ConfigContext } from '@/core/components/Providers';
import { usePublishMessageServiceStream, useReadMessagesByConversationIdService } from '@/core/services/message';
import { uuidToHex } from '@/core/utils';
import { CONVERSATIONS } from '@/core/utils/routes';

import { usePagedNormalizerFn } from '../hooks';
import { ConversationContext } from './ConversationContext';
import { ConversationMessageList } from './ConversationMessageList';
import { QuotedMessages } from './QuotedMessage';

export interface ConversationProps {
  conversation_id: string;
}

export const NEW_CONVERSATION_MARKER = 'new';

export const Conversation = ({ conversation_id }: ConversationProps) => {
  const isNewConversation = conversation_id === NEW_CONVERSATION_MARKER;
  const router = useRouter();
  const abortControllerRef = useRef<AbortController>();
  const textboxBgColor = useColorModeValue('blackAlpha.100', 'whiteAlpha.100');

  const customizations = useContext(ConversationContext);
  const { config } = useContext(ConfigContext);

  const { popperRef, referenceRef } = usePopper({ placement: 'left' });

  const {
    data,
    isSuccess,
    hasPreviousPage = false,
    fetchPreviousPage,
  } = useReadMessagesByConversationIdService(conversation_id, {
    // trigger: !isNewConversation,
    newConversationMarker: NEW_CONVERSATION_MARKER,
    useErrorBoundary: true,
    variables: { sort: ['created_at:desc'], pageSize: 8 },
    select: (data) => {
      return { ...data, pages: data.pages.map((page) => page.data) };
    },
  });

  useEffect(() => {
    const handler = (_event: Event) => {
      abortControllerRef.current!.signal.throwIfAborted();
      abortControllerRef.current = new AbortController();
    };

    abortControllerRef.current = new AbortController();
    abortControllerRef.current.signal.addEventListener('abort', handler);

    return () => abortControllerRef.current?.signal.removeEventListener('abort', handler);
  }, []);

  const pagedNormalizer = usePagedNormalizerFn();

  const publishMessageHandler = usePublishMessageServiceStream({
    signal: abortControllerRef.current?.signal,
    newConversationMarker: NEW_CONVERSATION_MARKER,
    onStreamEnd: (stream) => {
      isNewConversation && router.replace(`${CONVERSATIONS}/${uuidToHex(stream.channel.split(':').at(-1)!)}`);
    },
  });

  const publishMessageToConversation = useCallback(
    async (conversation_id: string, message: string, is_new: boolean, customizations: ConversationContext) => {
      const outboundMessage = message.trim();

      await publishMessageHandler.mutateAsync({
        message: { body: outboundMessage, conversation_id: is_new ? undefined : conversation_id },
        customizations: {
          quotes: Array.from(customizations.quoted_messages),
          context_length: customizations.context_size,
        },
      });
    },
    [publishMessageHandler],
  );

  const handleSend = useCallback(
    async (message: string) => {
      await publishMessageToConversation(conversation_id, message, isNewConversation, customizations);
    },
    [conversation_id, customizations, isNewConversation, publishMessageToConversation],
  );

  const messages = useMemo(() => {
    return !isSuccess ? [] : pagedNormalizer(data.pages.toReversed()).toReversed();
  }, [data?.pages, isSuccess, pagedNormalizer]);

  const user = config.session.user_account?.user;
  const scrollableTargetId = useId();

  if (!user) return null;

  return (
    <ChatBox justifyContent="center" alignItems="flex-end" flexDirection="column" overflow="hidden" width="inherit">
      <Flex id={scrollableTargetId} width="full" overflow="auto" marginBlockEnd="auto" flexDirection="column-reverse">
        <InfiniteScroll
          scrollableTarget={scrollableTargetId}
          dataLength={messages.length}
          hasMore={hasPreviousPage}
          next={() => fetchPreviousPage()}
          inverse={true}
          loader={null}
          style={{ display: 'flex', overflow: 'initial', flexDirection: 'column-reverse' }}
        >
          <ConversationMessageList messages={messages} user={user} useWorker={false} />
        </InfiniteScroll>
      </Flex>

      <Box px={3} my={8} width="full" position="relative" ref={referenceRef}>
        <Portal>
          <QuotedMessages user={user} messages={messages} ref={popperRef} />
        </Portal>
        <ChatTextBox onSend={handleSend} bgColor={textboxBgColor} isSending={publishMessageHandler.isLoading} />
      </Box>
    </ChatBox>
  );
};
