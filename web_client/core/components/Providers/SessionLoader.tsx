'use client';

import { useIdentifyUserAccountService } from '@/core/services';

import { Fragment, ReactNode, useContext, useEffect } from 'react';

import { ConfigContext, actions } from './ConfigProvider';

export interface SessionLoaderProps {
  children: ReactNode;
}

export const SessionLoader = (props: SessionLoaderProps) => {
  const { config, updateConfig } = useContext(ConfigContext);

  const { data, isSuccess, isLoading, refetch } = useIdentifyUserAccountService({
    trigger: true,
    select: (data) => data.data,
  });

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
    updateConfig(actions.createUserAccountUpdateAction(data));
    updateConfig(actions.createSessionLoaderStateUpdateAction('loaded'));
  }, [data, isLoading, isSuccess, updateConfig]);

  return <Fragment>{props.children}</Fragment>;
};
