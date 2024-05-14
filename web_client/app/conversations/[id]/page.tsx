import { Metadata, ResolvingMetadata } from 'next';

import { PageProps } from '@/app/types';
import { PrivateRoute } from '@/core/components/Providers';
import { Conversation } from '@/core/composition/Conversation';
import { ConversationLayout } from '@/core/composition/ConversationLayout';
import { readServerConversationById } from '@/core/services/server';
import { Routes } from '@/core/utils/routes';
import { isErrorResponse } from '@/core/services/utils';

export type ConversationPageProps = PageProps<{ id: string }>;

export const generateMetadata = async (args: ConversationPageProps, parent?: ResolvingMetadata): Promise<Metadata> => {
  const parentMetadata = await parent;
  const conversation_id = args.params.id;
  const isNewConversation = conversation_id === Routes.CONVERSATIONS_NEW.split('/').at(-1)!;
  const metadata: Metadata = {
    // @ts-expect-error
    title: { template: parentMetadata?.title?.template, default: 'Start a conversation' },
    themeColor: [
      { media: '(prefers-color-scheme: dark)', color: '#000000' },
      { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    ],
  };

  if (isNewConversation) return metadata;

  return await readServerConversationById(args.params.id)
    .then((response) => {
      return Object.assign<Metadata, Partial<Metadata>>(metadata, {
        title: response.data.data.subject,
        description: response.data.data.subject,
      });
    })
    .catch((e) => {
      console.error(import.meta.url, e);
      return Object.assign<Metadata, Partial<Metadata>>(metadata, {
        title: isErrorResponse(e) ? e.title : 'Error',
      });
    });
};

const Conversations = ({ params }: ConversationPageProps) => {
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
