import { VStack } from '@/chakra-ui/react';

import { ConversationMessage, ConversationMessageRoleEnum, User } from '@/client/api';
import { ConversationMesssage } from '@/core/components/ConversationMessage';
import { APP_NAME, fullname } from '@/core/utils';

export interface ConversationMessagesProps {
  messages: ConversationMessage[];
  user: User;
}

export const ConversationMessageList = ({ messages, user }: ConversationMessagesProps) => {
  return (
    <VStack spacing={0} width="full" height="full" alignItems="flex-start" py={4} fontSize="md">
      {messages.map((message) => {
        const entity = message.role === ConversationMessageRoleEnum.ROBOT ? APP_NAME : fullname(user);

        return (
          <ConversationMesssage
            key={message.id}
            enitity={entity}
            message={message.body}
            message_id={message.id}
            role={message.role}
          />
        );
      })}
    </VStack>
  );
};
