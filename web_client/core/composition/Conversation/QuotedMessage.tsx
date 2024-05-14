'use client';

import { useContext, useMemo } from 'react';

import {
  Box,
  Button,
  forwardRef,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Portal,
  Tag,
  useDisclosure,
  VStack,
} from '@/chakra-ui/react';

import { ConversationMessage, ConversationMessageRoleEnum, User } from '@/client';

import { ConversationContext } from './ConversationContext';
import { ConversationMesssage } from '@/core/components/ConversationMessage';
import { APP_NAME } from '@/core/utils/settings';
import { fullname } from '@/core/utils';
import { backdropFactory } from '@/core/theme';
import { useThemeConstants } from '../hooks';

export interface QuotedMessagesProps {
  user: User;
  messages: ConversationMessage[];
}

export const QuotedMessages = forwardRef(({ user, messages }: QuotedMessagesProps, ref) => {
  const { isOpen, onClose, onToggle } = useDisclosure();

  const { blended_hover_bg } = useThemeConstants();

  const { quoted_messages: quoted } = useContext(ConversationContext);
  const quotedMessages = useMemo(() => messages.filter((m) => quoted.has(m.id)), [messages, quoted]);

  return (
    <Box position="relative" ref={ref}>
      <Popover
        isOpen={isOpen}
        strategy="fixed"
        onClose={onClose}
        closeOnEsc={true}
        closeOnBlur={false}
        placement="left-start"
      >
        <PopoverTrigger>
          <Tag
            width="7"
            height="7"
            as={Button}
            color="blue.100"
            bgColor="blue.600"
            colorScheme="blue"
            onClick={onToggle}
            alignItems="center"
            borderRadius="full"
            justifyContent="center"
          >
            {quoted.size}
          </Tag>
        </PopoverTrigger>

        <Portal>
          <PopoverContent p={2} height="full" overflow="auto" borderWidth={0} borderRadius="xl" bgColor="transparent">
            <VStack width="full" position="relative">
              {quotedMessages.map((quotedMessage) => {
                const entity = quotedMessage.role === ConversationMessageRoleEnum.ROBOT ? APP_NAME : fullname(user);
                return (
                  <Box key={quotedMessage.id} width="full" borderRadius="xl" overflowX="visible">
                    <ConversationMesssage
                      entity={entity}
                      role={quotedMessage.role}
                      message={quotedMessage.body}
                      message_id={quotedMessage.id}
                      isParsed={false}
                      isQuouted={quoted.has(quotedMessage.id)}
                      py={4}
                      noOfLines={3}
                      fontSize="sm"
                      boxShadow="lg"
                      borderWidth={1}
                      borderRadius="xl"
                      {...backdropFactory({ bgColor: blended_hover_bg })}
                    />
                  </Box>
                );
              })}
            </VStack>
          </PopoverContent>
        </Portal>
      </Popover>
    </Box>
  );
});
