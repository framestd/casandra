'use client';

import { HStack, Icon, IconButton, StackProps, useColorModeValue, VStack } from '@/chakra-ui/react';

import { IoArrowUndoOutline } from 'react-icons/io5';

import { ConversationMessageRoleEnum } from '@/client';
import { isFunction } from '@/core/utils';

import { AppAvatar, UserAvatar } from '../Avatars';
import { Markdown } from '../Markdown';
import { Typography } from '../Typography';

export interface ConversationMessageProps extends StackProps {
  message_id: string;
  message: string;
  role: ConversationMessageRoleEnum;
  entity: string;
  isStreaming?: boolean;
  isParsed?: boolean;
  isQuouted: boolean;
  onQuote?: (message_id: string) => void;
}

export const messageToId = (message: string) => `message-${message.replace(/\s+/g, '-')}`;

export const ConversationMesssage = ({
  message_id,
  message,
  entity,
  role,
  isQuouted,
  isParsed = false,
  onQuote,
  noOfLines,
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
        {isAssistant ? <AppAvatar size="sm" /> : <UserAvatar name={entity} size="sm" />}

        {isFunction(onQuote) && (
          <IconButton
            size="sm"
            aria-label="quote"
            colorScheme="blue"
            borderRadius="full"
            onClick={() => onQuote(message_id)}
            variant={isQuouted ? 'solid' : 'ghost'}
            color={isQuouted ? 'blue.100' : undefined}
            bgColor={isQuouted ? 'blue.600' : undefined}
            icon={<Icon as={IoArrowUndoOutline} fontSize="md" />}
            _hover={isQuouted ? { bgColor: 'blue.700' } : undefined}
            _active={isQuouted ? { bgColor: 'blue.500' } : undefined}
          />
        )}
      </VStack>

      <Typography
        width="0"
        flex="1 1 auto"
        noOfLines={noOfLines}
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
          isParsed ? (
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
