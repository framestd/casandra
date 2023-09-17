'use client';

import { ReactNode } from 'react';

import { Avatar, Box, HStack, StackProps, useColorModeValue } from '@/chakra-ui/react';

import { ChatMessageRoleEnum } from '@/client';

import { Typography } from '../Typography';

export interface ChatMessageProps extends StackProps {
  message: ReactNode;
  role: ChatMessageRoleEnum;
  enitity: string;
  streaming?: boolean;
}

export const ConversationMesssage = ({ message, enitity, role, ...rest }: ChatMessageProps) => {
  const highlght = useColorModeValue('blackAlpha.100', 'whiteAlpha.100');
  return (
    <HStack
      px={3}
      py={2}
      width="full"
      alignItems="baseline"
      bgColor={role === ChatMessageRoleEnum.ROBOT ? highlght : undefined}
      {...rest}
    >
      <Avatar name={enitity} size="sm" position="sticky" top={0} userSelect="none" />

      <Box>
        <Typography whiteSpace="pre-wrap">{message}</Typography>
      </Box>
    </HStack>
  );
};
