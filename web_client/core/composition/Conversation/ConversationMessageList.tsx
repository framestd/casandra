import '@/core/components/Markdown/markdown.scss';

import { useEffect, useState } from 'react';

import { VStack } from '@/chakra-ui/react';

import DOMPurify from 'dompurify';

import { ConversationMessage, ConversationMessageRoleEnum, User } from '@/client/api';
import { ConversationMesssage } from '@/core/components/ConversationMessage';
import { createMarkdownWorkerMessageHandler } from '@/core/components/Markdown';
import { APP_NAME, fullname } from '@/core/utils';

export interface ConversationMessagesProps {
  messages: ConversationMessage[];
  user: User;
  useWorker?: boolean;
}

export const ConversationMessageList = ({
  messages: rawMessages,
  user,
  useWorker = false,
}: ConversationMessagesProps) => {
  const [parsedMessages, setParsedMessages] = useState<ConversationMessage[]>([]);

  useEffect(() => {
    if (!useWorker) return;

    const worker = new Worker(new URL('./renderer.ts', import.meta.url));

    const handleMessageFromWorker = createMarkdownWorkerMessageHandler<ConversationMessage[]>((data) => {
      const purify = DOMPurify(window);
      setParsedMessages(() =>
        data.map((d) => {
          const sanitized: ConversationMessage = { ...d, body: purify.sanitize(d.body) };
          return sanitized;
        }),
      );
    });

    worker.addEventListener('message', handleMessageFromWorker);
    worker.postMessage(rawMessages);
    return () => worker.terminate();
  }, [rawMessages, useWorker]);

  const messages = useWorker ? parsedMessages : rawMessages;

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
            parsed={useWorker}
          />
        );
      })}
    </VStack>
  );
};
