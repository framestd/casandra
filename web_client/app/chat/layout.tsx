import type { Metadata, ResolvingMetadata } from 'next';
import { Fragment, ReactNode } from 'react';

export interface ChatPageLayoutProps {
  children?: ReactNode;
}

export const generateMetadata = async (_: any, parent?: ResolvingMetadata): Promise<Metadata> => {
  const parentTitle = (await parent)?.title;

  return {
    // @ts-expect-error
    title: { template: parentTitle?.template, default: 'Start a conversation' },
    themeColor: [
      { media: '(prefers-color-scheme: dark)', color: '#12222a' },
      { media: '(prefers-color-scheme: light)', color: '#12222a' },
    ],
  };
};

export default function ChatPageLayout({ children }: ChatPageLayoutProps) {
  return <Fragment>{children}</Fragment>;
}
