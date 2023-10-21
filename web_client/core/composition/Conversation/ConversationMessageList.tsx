import '@/core/components/Markdown/markdown.scss';

import { useCallback, useContext, useEffect, useState } from 'react';

import { VStack } from '@/chakra-ui/react';

import DOMPurify from 'dompurify';
import { ToastOptions } from 'react-toastify';

import { ConversationMessage, ConversationMessageRoleEnum, User } from '@/client/api';
import { toast } from '@/core/components/AppToast';
import { ConversationMesssage } from '@/core/components/ConversationMessage';
import { createMarkdownWorkerMessageHandler } from '@/core/components/Markdown';
import { APP_NAME, MAX_ALLOWED_QUOTED_MESSAGES } from '@/core/utils';

import { addQuotedMessage, ConversationContext, removeQuotedMessage } from './ConversationContext';

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
  const { updateCustomizations, quoted_messages } = useContext(ConversationContext);

  const quoteMessage = useCallback(
    (message_id: string) => {
      const toastOpts: ToastOptions = { position: 'top-center' };
      const limitMessage = {
        title: 'Quote Limit Exceeded',
        message: `You can only quote up to ${MAX_ALLOWED_QUOTED_MESSAGES} messages`,
      };

      if (quoted_messages.has(message_id)) {
        return updateCustomizations(removeQuotedMessage(message_id));
      } else if (quoted_messages.size === MAX_ALLOWED_QUOTED_MESSAGES) {
        return void toast.info(limitMessage, toastOpts);
      }

      updateCustomizations(addQuotedMessage(message_id));
    },
    [quoted_messages, updateCustomizations],
  );

  useEffect(() => {
    if (!useWorker) return;

    const worker = new Worker(new URL('./renderer.worker.ts', import.meta.url));

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
        const entity = message.role === ConversationMessageRoleEnum.ROBOT ? APP_NAME : user.fullname;

        return (
          <ConversationMesssage
            key={message.id}
            entity={entity}
            role={message.role}
            message={message.body}
            message_id={message.id}
            isParsed={useWorker}
            isQuouted={quoted_messages.has(message.id)}
            onQuote={quoteMessage}
          />
        );
      })}
    </VStack>
  );
};
