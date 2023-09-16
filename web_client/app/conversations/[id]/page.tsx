'use client';

import { useContext, useEffect, useState } from 'react';

import { Box, Flex, VStack } from '@/chakra-ui/react';

import { useRouter } from 'next/navigation';

import { ChatMessageRoleEnum, Message } from '@/client';
import { ChatBox } from '@/core/components/ChatBox';
import { ChatMesssage } from '@/core/components/ChatMessage';
import { ChatTextBox } from '@/core/components/ChatTextBox';
import { FlowBalls } from '@/core/components/Loader';
import { ConfigContext, PrivateRoute } from '@/core/components/Providers';
import { ChatLayout } from '@/core/composition/ChatLayout';
import { usePagedNormalizerFn } from '@/core/composition/hooks';
import {
  useConversationMessageSocket, usePublishMessageService, useReadMessagesByConversationIdService
} from '@/core/services';
import { APP_NAME, fullname } from '@/core/utils';
import { CONVERSATIONS } from '@/core/utils/routes';

type PageProps<Params> = { params: Params; searchParams: { [x: string]: string | string[] | undefined } };

type ChatProps = PageProps<{ id: string }>;

const Conversations = ({ params }: ChatProps) => {
  const conversationId: string = params.id;

  const router = useRouter();

  const { data, isSuccess, isLoading } = useReadMessagesByConversationIdService(conversationId, {
    trigger: conversationId !== 'new',
    variables: { sort: ['created_at:asc'] },
    select: (data) => {
      return { ...data, pages: data.pages.map((page) => page.data) };
    },
  });

  const socketMessage = useConversationMessageSocket(conversationId);

  const [userMessage, setUserMessage] = useState('');
  const [conversations, setConversations] = useState<Partial<Message>[]>([]);

  const { config } = useContext(ConfigContext);

  const user = config.session.user_account?.user;

  const publishMessageHandler = usePublishMessageService();

  const pagedNormalizer = usePagedNormalizerFn();

  useEffect(() => {
    if (!isSuccess || isLoading) return;

    setConversations(pagedNormalizer(data.pages));
  }, [data?.pages, isLoading, isSuccess, pagedNormalizer]);

  const handleChange = (message: string) => {
    setUserMessage(message);
  };

  const handleSend = async () => {
    const outboundMessage = userMessage.trim();
    const newConversations = conversations.slice();

    newConversations.push({ role: ChatMessageRoleEnum.HUMAN, body: outboundMessage });

    setConversations(newConversations);
    setUserMessage('');

    let resolvedConversationId = conversationId;

    if (conversationId === 'new') {
      const response = await publishMessageHandler.mutateAsync({ body: '<noop>' });
      const data = response.data.data;

      resolvedConversationId = data.conversation_id;
    }

    const response = await publishMessageHandler.mutateAsync({
      body: outboundMessage,
      conversation_id: resolvedConversationId,
    });

    const publishedMessage = response.data.data;
    const newNormalizedConversations = newConversations.slice(0, newConversations.length - 1);

    newNormalizedConversations.push(publishedMessage);

    setConversations(newNormalizedConversations);

    conversationId === 'new' && router.replace(`${CONVERSATIONS}/${resolvedConversationId}`);
  };

  return (
    <PrivateRoute>
      <ChatLayout name={user ? fullname(user) : ''}>
        <Flex justifyContent="center" height="full">
          <ChatBox justifyContent="center" alignItems="flex-end" flexDirection="column">
            <VStack width="full" height="full" alignItems="flex-start" py={4} fontSize="md" overflow="auto">
              {(conversations as Message[]).map((c, i) => {
                const entity = c.role === ChatMessageRoleEnum.ROBOT ? APP_NAME : user ? fullname(user) : c.role;

                return <ChatMesssage key={c.id || i} enitity={entity} message={c.body} role={c.role} />;
              })}

              {publishMessageHandler.isLoading && (
                <ChatMesssage message={<FlowBalls />} enitity={APP_NAME} role={ChatMessageRoleEnum.ROBOT} />
              )}

              {socketMessage && (
                <ChatMesssage
                  key={socketMessage.id}
                  message={socketMessage.body}
                  enitity={APP_NAME}
                  role={ChatMessageRoleEnum.ROBOT}
                  streaming={true}
                />
              )}
            </VStack>

            <Box px={3} width="full">
              <ChatTextBox
                my={8}
                value={userMessage}
                onChange={handleChange}
                onSend={handleSend}
                isSendDisabled={publishMessageHandler.isLoading || userMessage.trim() === ''}
              />
            </Box>
          </ChatBox>
        </Flex>
      </ChatLayout>
    </PrivateRoute>
  );
};

export default Conversations;
