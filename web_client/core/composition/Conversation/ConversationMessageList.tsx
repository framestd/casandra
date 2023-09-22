import { VStack } from '@/chakra-ui/react';
import { ChatMessageRoleEnum, Message, User } from '@/client/api';
import { ConversationMesssage } from '@/core/components/ConversationMessage';
import { APP_NAME, fullname } from '@/core/utils';

export interface ConversationMessagesProps {
  messages: Message[];
  user: User;
}

export const ConversationMessageList = ({ messages, user }: ConversationMessagesProps) => {
  return (
    <VStack spacing={0} width="full" height="full" alignItems="flex-start" py={4} fontSize="md">
      {messages.map((c) => {
        const entity = c.role === ChatMessageRoleEnum.ROBOT ? APP_NAME : fullname(user);

        return <ConversationMesssage key={c.id} enitity={entity} message={c.body} role={c.role} />;
      })}
    </VStack>
  );
};
