import { useState } from 'react';

import { Button, Flex, Icon, IconButton, StackProps, useColorModeValue, VStack } from '@/chakra-ui/react';

import Link from 'next/link';
import { AiOutlineEdit } from 'react-icons/ai';
import { TbMessage } from 'react-icons/tb';

import { Conversation, ConversationUpdate } from '@/client';
import { EmbeddableRevisionInput } from '@/core/components/Input';
import { Typography } from '@/core/components/Typography';
import { WithId } from '@/core/services';
import { CONVERSATIONS } from '@/core/utils/routes';

import { useThemeConstants } from '../hooks';

export interface ConversationListProps extends StackProps {
  conversations: Conversation[];
  activeConversationId: string;
  onReviseTopic?: (revision: WithId<ConversationUpdate>) => void;
}

export const itemToId = (item: string) => `item-${item.replace(/\s+/g, '-')}`;

export const ConversationList = ({ conversations, activeConversationId, onReviseTopic }: ConversationListProps) => {
  const messageIconColor = useColorModeValue('green.600', 'green.400');
  const buttonColorScheme = useColorModeValue('blackAlpha', 'whiteAlpha');
  const textOverflowShade = useColorModeValue('#ecf0f0', '#141414');
  const textOverflowShadeActive = useColorModeValue('#dadfdf', '#262626');
  const textOverflowShadeHover = useColorModeValue('#dce0e1', '#222222');
  const { blended_c, blended_active_bg, blended_hover_bg } = useThemeConstants();
  const [idOfConversationToEdit, setIdOfConversationToEdit] = useState<string>();

  const btnPx = 4;
  const inputHeight = '2.5rem';
  const inputPs = '3.375rem';

  const handleRestore = () => setIdOfConversationToEdit(undefined);

  const saveTopicRevision = (topic: string) => {
    if (!idOfConversationToEdit) return;
    onReviseTopic?.({ id: idOfConversationToEdit, subject: topic });

    handleRestore();
  };

  return (
    <VStack width="full" alignItems="flex-start" flex="1 1 auto">
      {conversations.map((conversation) => {
        const isActive = activeConversationId === conversation.id;
        const isInEditState = conversation.id === idOfConversationToEdit;

        const handleEditClick = () => setIdOfConversationToEdit(conversation.id);

        return (
          <Flex
            width="full"
            alignItems="center"
            key={conversation.id}
            bgColor={isActive ? blended_active_bg : undefined}
            sx={{ '--text-overflow-shade': isActive ? textOverflowShadeActive : textOverflowShade }}
            _hover={{
              bgColor: isActive ? undefined : blended_hover_bg,
              '--text-overflow-shade': isActive ? undefined : textOverflowShadeHover,
            }}
            _active={{ bgColor: blended_active_bg }}
          >
            {idOfConversationToEdit !== conversation.id && (
              <Button
                as={Link}
                width="full"
                variant="ghost"
                borderRadius={0}
                color="currentcolor"
                bgColor="transparent"
                justifyContent="flex-start"
                title={conversation.subject}
                data-item={itemToId(conversation.id)}
                colorScheme={buttonColorScheme}
                href={`${CONVERSATIONS}/${conversation.id}`}
                leftIcon={<Icon as={TbMessage} fontSize="lg" color={messageIconColor} />}
                _hover={{ bgColor: 'transparent' }}
                _active={{ bgColor: 'transparent' }}
              >
                <Typography
                  ps={3}
                  fontWeight="600"
                  fontSize="sm"
                  isTruncated={true}
                  width="full"
                  position="relative"
                  sx={{ maskImage: `linear-gradient(90deg, var(--text-overflow-shade) 50%, transparent)` }}
                >
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
                onRevise={saveTopicRevision}
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
  );
};
