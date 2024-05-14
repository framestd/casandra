import { ConversationMessage, ConversationMessageRoleEnum } from '@/client';
import { markdown } from '@/core/utils/markdown';

self.addEventListener('message', (event: MessageEvent<ConversationMessage[]>) => {
  const data = event.data;
  const result: ConversationMessage[] = data.map((d) => {
    if (d.role === ConversationMessageRoleEnum.HUMAN) return d;
    return { ...d, body: markdown(d.body) };
  });

  self.postMessage(result);
});
