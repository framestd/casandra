'use client';

import { Avatar, HStack, StackProps, useColorModeValue } from '@/chakra-ui/react';

import { ConversationMessageRoleEnum } from '@/client';

import { Typography } from '../Typography';
import { Markdown } from '../Markdown/Markdown';

export interface ChatMessageProps extends StackProps {
  message: string;
  role: ConversationMessageRoleEnum;
  enitity: string;
  streaming?: boolean;
}

export const ConversationMesssage = ({ message, enitity, role, ...rest }: ChatMessageProps) => {
  const highlght = useColorModeValue('blackAlpha.100', 'whiteAlpha.100');
  const isAssistant = role === ConversationMessageRoleEnum.ROBOT;
  return (
    <HStack
      px={3}
      py={8}
      spacing={4}
      width="full"
      alignItems="baseline"
      borderBottomWidth={1}
      bgColor={isAssistant ? highlght : undefined}
      {...rest}
    >
      <Avatar name={enitity} size="sm" position="sticky" top={0} userSelect="none" />

      <Typography
        width="0"
        flex="1 1 auto"
        whiteSpace="pre-wrap"
        sx={{ '& > *:not(pre.hljs)': { whiteSpace: 'pre-wrap', width: 'full' } }}
      >
        {isAssistant ? <Markdown markdown={message} /> : message}
      </Typography>
    </HStack>
  );
};
