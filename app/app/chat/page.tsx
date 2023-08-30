'use client';

import { Box, Flex, VStack } from '@/chakra-ui/react';

import { ChatBox } from '@/core/components/ChatBox';
import { ChatMesssage } from '@/core/components/ChatMessage';
import { ChatTextBox } from '@/core/components/ChatTextBox';
import { FlowBalls } from '@/core/components/Loader';
import { ConfigContext, PrivateRoute } from '@/core/components/Providers';
import { ChatLayout } from '@/core/composition/ChatLayout';
import { useSendMessage } from '@/core/services';
import { fullname } from '@/core/utils';

import { useContext, useEffect, useState } from 'react';

export interface Conversation {
  role: 'assistant' | 'user';
  message: string;
  responsed?: boolean;
}

const Chat = () => {
  const [message, setMessage] = useState('');
  const [conversations, setConversations] = useState<Conversation[]>([]);

  const { config } = useContext(ConfigContext);
  const user = config.session.user_account?.user;

  const chatMessageHandler = useSendMessage();

  useEffect(() => {
    const rgb = [18, 34, 42];
    const properties: [string, string] = ['--background-start-rgb', '--background-end-rgb'];
    const bodyStyles = window.getComputedStyle(document.body);
    const values: [string, string] = [
      bodyStyles.getPropertyValue(properties.at(0)!),
      bodyStyles.getPropertyValue(properties.at(1)!),
    ];

    if (config.session_loader_state === 'loaded') {
      document.body.style.setProperty(properties.at(0)!, rgb.join(', '));
      document.body.style.setProperty(properties.at(1)!, rgb.join(', '));
    }

    return () => {
      document.body.style.setProperty(properties.at(0)!, values.at(0)!);
      document.body.style.setProperty(properties.at(1)!, values.at(1)!);
    };
  }, [config.session_loader_state]);

  const handleChange = (message: string) => {
    setMessage(message);
  };

  const handleSend = async () => {
    const outbound_message = message.trim();

    const newConversations = conversations.slice();

    newConversations.push({ role: 'user', message: outbound_message, responsed: false });

    setConversations(newConversations);
    setMessage('');

    const response = await chatMessageHandler.mutateAsync({ message_body: outbound_message });

    const choices = response.data.response.choices;

    const newConversationsWithResponse = newConversations.slice(0, newConversations.length - 1);

    newConversationsWithResponse.push({ ...newConversations.at(-1)!, responsed: true });
    newConversationsWithResponse.push({ role: 'assistant', message: choices.at(0)!.message.content });

    setConversations(newConversationsWithResponse);
  };

  return (
    <PrivateRoute>
      <ChatLayout name={user ? fullname(user) : ''}>
        <Flex justifyContent="center" height="full">
          <ChatBox justifyContent="center" alignItems="flex-end" flexDirection="column">
            <VStack width="full" height="full" alignItems="flex-start" py={4} fontSize="md" overflow="auto">
              {conversations.map((c, i) => {
                const role = c.role === 'assistant' ? c.role : user ? fullname(user) : c.role;

                return <ChatMesssage key={i} message={c.message} role={role} color="white" />;
              })}

              {chatMessageHandler.isLoading && (
                <ChatMesssage message={<FlowBalls />} role={'assistant'} color="white" />
              )}
            </VStack>

            <Box px={3} width="full">
              <ChatTextBox
                my={8}
                value={message}
                onChange={handleChange}
                onSend={handleSend}
                isSendDisabled={chatMessageHandler.isLoading || message.trim() === ''}
              />
            </Box>
          </ChatBox>
        </Flex>
      </ChatLayout>
    </PrivateRoute>
  );
};

export default Chat;
