import { useState } from 'react';

import { Button, Flex, Icon, IconButton, StackProps, useColorModeValue, VStack } from '@/chakra-ui/react';

import Link from 'next/link';
import { CiEdit } from 'react-icons/ci';
import { PiChatTeardropText } from 'react-icons/pi';

import { EmbeddableRevisionInput } from '@/core/components/Input';
import { Typography } from '@/core/components/Typography';
import { usePagedNormalizer } from '@/core/composition/hooks';
import { useReadConversationsService, useReviseConversationService } from '@/core/services/conversation';
import { backdropFactory } from '@/core/theme';
import { CONVERSATIONS } from '@/core/utils/routes';

export interface ConversationBarProps extends StackProps {
  activeConversationId: string;
}

export const ConversationBar = ({ activeConversationId, ...rest }: ConversationBarProps) => {
  const { data } = useReadConversationsService({
    variables: { sort: ['created_at:desc'] },
    select: (data) => {
      return { ...data, pages: data.pages.map((page) => page.data) };
    },
  });

  const conversationHover = useColorModeValue('blackAlpha.100', 'whiteAlpha.100');
  const conversationActive = useColorModeValue('blackAlpha.200', 'whiteAlpha.200');
  const bgColor = useColorModeValue('whiteAlpha.500', 'whiteAlpha.200');
  const buttonColorScheme = useColorModeValue('blackAlpha', 'whiteAlpha');
  const txtOverflowShade = useColorModeValue('#e5ebec', '#141414');
  const txtOverflowShadeActive = useColorModeValue('#d7dbdb', '#262626');
  const conversations = usePagedNormalizer(data?.pages || []);
  const [idOfConversationToEdit, setIdOfConversationToEdit] = useState<string>();

  const btnPx = 4;
  const inputHeight = '2.5rem';
  const inputPs = '3.375rem';

  const reviseConversationHandler = useReviseConversationService();

  const handleRestore = () => setIdOfConversationToEdit(undefined);

  const saveRevision = (changes: string) => {
    if (!idOfConversationToEdit) return;
    reviseConversationHandler.mutate({ id: idOfConversationToEdit, subject: changes });

    handleRestore();
  };

  return (
    <VStack
      height="full"
      width="full"
      borderRadius="3xl"
      alignItems="flex-start"
      {...backdropFactory({ bgColor })}
      {...rest}
    >
      {conversations.map((conversation) => {
        const isActive = activeConversationId === conversation.id;
        const isInEditState = conversation.id === idOfConversationToEdit;

        const handleEditClick = () => setIdOfConversationToEdit(conversation.id);

        return (
          <Flex
            key={conversation.id}
            width="full"
            alignItems="center"
            bgColor={isActive ? conversationActive : undefined}
            _hover={{ bgColor: conversationHover }}
            _active={{ bgColor: conversationActive }}
          >
            {idOfConversationToEdit !== conversation.id && (
              <Button
                as={Link}
                href={`${CONVERSATIONS}/${conversation.id}`}
                borderRadius={0}
                colorScheme={buttonColorScheme}
                color="currentcolor"
                width="full"
                variant="ghost"
                justifyContent="flex-start"
                leftIcon={<Icon as={PiChatTeardropText} fontSize="lg" />}
                bgColor="transparent"
                _hover={{ bgColor: 'transparent' }}
                _active={{ bgColor: 'transparent' }}
                _after={{
                  content: '""',
                  height: 'full',
                  width: '80px',
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  bgGradient: `linear(to-l, ${isActive ? txtOverflowShadeActive : txtOverflowShade} 40%, transparent)`,
                  zIndex: 1,
                }}
              >
                <Typography ps={3} py={2} fontWeight="600" fontSize="sm" isTruncated={true} position="relative">
                  {conversation.subject}
                </Typography>
              </Button>
            )}

            {idOfConversationToEdit === conversation.id && (
              <EmbeddableRevisionInput
                _ps={inputPs}
                _height={inputHeight}
                _value={conversation.subject}
                _LeftIcon={PiChatTeardropText}
                _LeftIconProps={{ ps: btnPx, pe: 5 }}
                onRestore={handleRestore}
                onRevise={saveRevision}
              />
            )}

            {isActive && !isInEditState && (
              <IconButton
                size="sm"
                aria-label="Edit Conversation"
                variant="ghost"
                borderRadius="full"
                colorScheme={buttonColorScheme}
                color="currentcolor"
                bgColor="transparent"
                icon={<Icon as={CiEdit} fontSize="lg" />}
                _hover={{ bgColor: conversationHover }}
                _active={{ bgColor: conversationActive }}
                onClick={handleEditClick}
              />
            )}
          </Flex>
        );
      })}
    </VStack>
  );
};
