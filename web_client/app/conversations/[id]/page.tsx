import { PrivateRoute } from '@/core/components/Providers';
import { Conversation } from '@/core/composition/Conversation';
import { ConversationLayout } from '@/core/composition/ConversationLayout';

type PageProps<Params> = { params: Params; searchParams: { [x: string]: string | string[] | undefined } };

type ChatProps = PageProps<{ id: string }>;

const Conversations = ({ params }: ChatProps) => {
  const conversation_id: string = params.id;

  return (
    <PrivateRoute>
      <ConversationLayout>
        <Conversation conversation_id={conversation_id} />
      </ConversationLayout>
    </PrivateRoute>
  );
};

export default Conversations;
