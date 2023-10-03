import { useEffect, useRef, useState } from 'react';
import DOMPurify from 'dompurify';

export interface MarkdownRendererProps {
  markdown: string;
}

export const MarkdownRenderer = ({ markdown }: MarkdownRendererProps) => {
  const workerRef = useRef<Worker>();
  const [renderedHtml, setRenderedHtml] = useState('');

  useEffect(() => {
    workerRef.current = new Worker(new URL('./renderer.ts', import.meta.url));
  }, []);

  useEffect(() => {
    const worker = workerRef.current;

    if (!worker) return;

    const handleMessageFromWorker = (event: MessageEvent<string>) => {
      const purify = DOMPurify(window);
      const sanitizedHtml = purify.sanitize(event.data);

      setRenderedHtml(sanitizedHtml);
    };

    worker.addEventListener('message', handleMessageFromWorker);
    worker.postMessage(markdown);

    return () => worker.terminate();
  }, [markdown]);

  return <div dangerouslySetInnerHTML={{ __html: renderedHtml }} />;
};
