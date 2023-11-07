'use client';

import { Fragment, ReactNode, useContext, useEffect } from 'react';

import { signOut } from 'next-auth/react';

import { useAppSession } from '@/core/composition/hooks';
import { useIdentifyUserAccountService } from '@/core/services/account';
import { appEventAdapter } from '@/core/services/events';
import { SignOutEvent, TokenRefreshEvent } from '@/core/services/events/client';
import { tokenRegistry } from '@/core/services/next-auth/registry';

import { actions, ConfigContext } from './ConfigProvider';

export interface SessionLoaderProps {
  children: ReactNode;
}

export const SessionLoader = (props: SessionLoaderProps) => {
  const session = useAppSession();
  const { config, updateConfig } = useContext(ConfigContext);

  const { data, isSuccess, isLoading, refetch } = useIdentifyUserAccountService({
    trigger: true,
    select: (data) => data.data,
  });

  useEffect(() => {
    const onSignOut = async (_e: SignOutEvent) => await signOut().then(() => tokenRegistry.clear());
    const onTokenRefresh = async (e: TokenRefreshEvent) => {
      tokenRegistry.register(e.detail!);
      await session.update({ ...session.data, tokens: e.detail });
    };
    appEventAdapter.listen('signout', onSignOut);
    appEventAdapter.listen('tokenrefresh', onTokenRefresh);
    return () => {
      appEventAdapter.unlisten('signout', onSignOut);
      appEventAdapter.unlisten('tokenrefresh', onTokenRefresh);
    };
  }, [session]);

  useEffect(() => {
    if (config.has_active_session && config.session.user_account === null) {
      updateConfig(actions.createSessionLoaderStateUpdateAction('reloading'));

      refetch().finally(() => updateConfig(actions.createSessionLoaderStateUpdateAction('loaded')));
    }
  }, [config.has_active_session, config.session.user_account, refetch, updateConfig]);

  useEffect(() => {
    if (!isSuccess && isLoading) return;

    if (!isSuccess && !isLoading) {
      return void updateConfig(actions.createSessionLoaderStateUpdateAction('loaded'));
    }

    updateConfig(actions.createHasActiveSessionUpdateAction(true));
    updateConfig(actions.createUserAccountUpdateAction(data.data));
    updateConfig(actions.createSessionLoaderStateUpdateAction('loaded'));
  }, [data, isLoading, isSuccess, updateConfig]);

  return <Fragment>{props.children}</Fragment>;
};
