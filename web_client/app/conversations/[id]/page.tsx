import { Flex } from '@/chakra-ui/react';

import { PrivateRoute } from '@/core/components/Providers';
import { ConversationLayout } from '@/core/composition/ConversationLayout';

import { Conversation } from '@/core/composition/Conversation';

type PageProps<Params> = { params: Params; searchParams: { [x: string]: string | string[] | undefined } };

type ChatProps = PageProps<{ id: string }>;

const Conversations = ({ params }: ChatProps) => {
  const conversation_id: string = params.id;

  return (
    <PrivateRoute>
      <ConversationLayout>
        <Flex justifyContent="center" height="full">
          <Conversation conversation_id={conversation_id} />
        </Flex>
      </ConversationLayout>
    </PrivateRoute>
  );
};

export default Conversations;
