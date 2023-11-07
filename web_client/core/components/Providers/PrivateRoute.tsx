'use client';

import { Fragment, ReactNode } from 'react';

import { signIn } from 'next-auth/react';
import { useAppSession } from '@/core/composition/hooks';

export interface PrivateRouteProps {
  children: ReactNode;
}

export const PrivateRoute = (props: PrivateRouteProps) => {
  const session = useAppSession();

  if (session.status === 'unauthenticated') {
    signIn(undefined, { callbackUrl: window.location.pathname + window.location.search });
    return null;
  }

  return <Fragment>{props.children}</Fragment>;
};
