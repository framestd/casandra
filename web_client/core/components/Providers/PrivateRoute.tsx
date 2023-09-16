'use client';

import { Fragment, ReactNode, useContext, useEffect } from 'react';

import { useRouter } from 'next/navigation';

import { SplashScreen } from '../Loader';
import { ConfigContext } from './ConfigProvider';

export interface PrivateRouteProps {
  children: ReactNode;
}

export const PrivateRoute = (props: PrivateRouteProps) => {
  const { config } = useContext(ConfigContext);
  const router = useRouter();

  useEffect(() => {
    if (!config.has_active_session && config.session_loader_state === 'loaded') {
      router.replace(`/signin?return=${window.location.href}`);
    }
  }, [config, router]);

  if (config.session_loader_state === 'loaded' && config.has_active_session)
    return <Fragment>{props.children}</Fragment>;

  return <SplashScreen title={config.application_config.name} />;
};
