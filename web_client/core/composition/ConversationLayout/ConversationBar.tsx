'use client';

import { useState } from 'react';

import { Button, Flex, Icon, IconButton, StackProps, useColorModeValue, VStack } from '@/chakra-ui/react';

import Link from 'next/link';
import { AiOutlineEdit } from 'react-icons/ai';
import { TbMessage } from 'react-icons/tb';

import { EmbeddableRevisionInput } from '@/core/components/Input';
import { Typography } from '@/core/components/Typography';
import { usePagedNormalizer, useThemeConstants } from '@/core/composition/hooks';
import { useReadConversationsService, useReviseConversationService } from '@/core/services/conversation';
import { backdropFactory } from '@/core/theme';
import { CONVERSATIONS } from '@/core/utils/routes';
import { ConversationBarToolbar } from './ConversationBarToolbar';

export interface ConversationBarProps extends StackProps {
  activeConversationId: string;
}

export const ConversationBar = ({ activeConversationId, ...rest }: ConversationBarProps) => {
  const [subjectFilter, setSubjectFilter] = useState<string>();
  const { data } = useReadConversationsService({
    variables: { sort: ['updated_at:desc'], subject: subjectFilter },
    select: (data) => {
      return {
        ...data,
        pages: data.pages.map((page) => page.data),
      };
    },
  });

  const messageIconColor = useColorModeValue('green.600', 'green.400');
  const buttonColorScheme = useColorModeValue('blackAlpha', 'whiteAlpha');
  const txtOverflowShade = useColorModeValue('#e5ebec', '#141414');
  const txtOverflowShadeActive = useColorModeValue('#d7dbdb', '#262626');
  const { blended_c, blended_bg, blended_active_bg, blended_hover_bg } = useThemeConstants();

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
      spacing={0}
      height="full"
      width="full"
      borderRadius="3xl"
      alignItems="flex-start"
      overflowY="auto"
      {...rest}
    >
      <ConversationBarToolbar filter={subjectFilter} onFilterChange={(filter) => setSubjectFilter(filter)} />

      <VStack width="full" height="full" {...backdropFactory({ bgColor: blended_bg })}>
        {conversations.map((conversation) => {
          const isActive = activeConversationId === conversation.id;
          const isInEditState = conversation.id === idOfConversationToEdit;

          const handleEditClick = () => setIdOfConversationToEdit(conversation.id);

          return (
            <Flex
              key={conversation.id}
              width="full"
              alignItems="center"
              bgColor={isActive ? blended_active_bg : undefined}
              _hover={{ bgColor: blended_hover_bg }}
              _active={{ bgColor: blended_active_bg }}
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
                  leftIcon={<Icon as={TbMessage} fontSize="lg" color={messageIconColor} />}
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
                    bgGradient: `linear(to-l, ${
                      isActive ? txtOverflowShadeActive : txtOverflowShade
                    } 40%, transparent)`,
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
                  _LeftIcon={TbMessage}
                  _LeftIconProps={{ ps: btnPx, pe: 5, color: messageIconColor }}
                  onRestore={handleRestore}
                  onRevise={saveRevision}
                />
              )}

              {isActive && !isInEditState && (
                <IconButton
                  me={2}
                  size="sm"
                  aria-label="Edit Conversation"
                  variant="ghost"
                  borderRadius="full"
                  colorScheme={buttonColorScheme}
                  color={blended_c}
                  bgColor="transparent"
                  icon={<Icon as={AiOutlineEdit} fontSize="lg" />}
                  _hover={{ bgColor: blended_hover_bg }}
                  _active={{ bgColor: blended_active_bg }}
                  onClick={handleEditClick}
                />
              )}
            </Flex>
          );
        })}
      </VStack>
    </VStack>
  );
};
