import { useEffect, useState } from 'react';

import DOMPurify from 'dompurify';

import { markdown } from '@/core/utils/markdown';

export interface MarkdownRendererProps {
  content: string;
  useWorker?: boolean;
}

const getMarkdownWorker = () => new Worker(new URL('./renderer.ts', import.meta.url));

export const createMarkdownWorkerMessageHandler = <T,>(callback: (res: T) => void) => {
  const markdownWorkerMessageHandler = (event: MessageEvent<T>) => callback(event.data);

  return markdownWorkerMessageHandler;
};

export const MarkdownRenderer = ({ content, useWorker = false }: MarkdownRendererProps) => {
  const [renderedHtml, setRenderedHtml] = useState('');

  useEffect(() => {
    if (useWorker) {
      const worker = getMarkdownWorker();
      const handleMessageFromWorker = createMarkdownWorkerMessageHandler<string>((result) => {
        const purify = DOMPurify(window);
        return setRenderedHtml(purify.sanitize(result));
      });

      worker.addEventListener('message', handleMessageFromWorker);
      worker.postMessage(content);

      return () => worker.terminate();
    }

    return queueMicrotask(() => setRenderedHtml(markdown(content)));
  }, [content, useWorker]);

  return <div dangerouslySetInnerHTML={{ __html: renderedHtml }} />;
};
