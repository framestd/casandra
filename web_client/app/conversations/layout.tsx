import { Fragment, ReactNode } from 'react';

export interface ChatPageLayoutProps {
  children?: ReactNode;
}

export default function ChatPageLayout({ children }: ChatPageLayoutProps) {
  return <Fragment>{children}</Fragment>;
}
