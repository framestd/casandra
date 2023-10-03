import { markdown } from '@/core/utils/markdown';

self.addEventListener('message', (event: MessageEvent<string>) => {
  self.postMessage(markdown(event.data));
});
