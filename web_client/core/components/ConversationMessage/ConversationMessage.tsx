'use client';

import { Avatar, HStack, Icon, IconButton, StackProps, useColorModeValue, VStack } from '@/chakra-ui/react';

import { IoArrowUndoOutline } from 'react-icons/io5';

import { ConversationMessageRoleEnum } from '@/client';

import { Markdown } from '../Markdown';
import { Typography } from '../Typography';

export interface ConversationMessageProps extends StackProps {
  message_id: string;
  message: string;
  role: ConversationMessageRoleEnum;
  enitity: string;
  streaming?: boolean;
  parsed?: boolean;
}

export const messageToId = (message: string) => `message-${message.replace(/\s+/g, '-')}`;

export const ConversationMesssage = ({
  message_id,
  message,
  enitity,
  role,
  parsed = false,
  ...rest
}: ConversationMessageProps) => {
  const highlght = useColorModeValue('blackAlpha.100', 'whiteAlpha.100');
  const isAssistant = role === ConversationMessageRoleEnum.ROBOT;

  return (
    <HStack
      px={3}
      py={8}
      spacing={6}
      width="full"
      id={messageToId(message_id)}
      alignItems="baseline"
      borderBottomWidth={1}
      bgColor={isAssistant ? highlght : undefined}
      {...rest}
    >
      <VStack spacing={4} height="full" position="sticky" top={3}>
        <Avatar name={enitity} size="sm" userSelect="none" />

        <IconButton
          aria-label="quote"
          size="sm"
          colorScheme="blue"
          variant="ghost"
          borderRadius="full"
          icon={<Icon as={IoArrowUndoOutline} fontSize="md" />}
        />
      </VStack>

      <Typography
        width="0"
        flex="1 1 auto"
        sx={{
          '& pre:not(:last-child)': { mb: 8 },
          '& p:not(:last-child)': {
            whiteSpace: 'pre-wrap',
            width: 'full',
            mb: 8,
          },
        }}
      >
        {isAssistant ? (
          parsed ? (
            <div dangerouslySetInnerHTML={{ __html: message }} />
          ) : (
            <Markdown content={message} useWorker={false} />
          )
        ) : (
          message
        )}
      </Typography>
    </HStack>
  );
};
