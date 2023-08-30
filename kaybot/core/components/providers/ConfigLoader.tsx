'use client';

import { useGetApplicationInfo } from '@/core/services/_app';
import { CONFIG_SCRIPT_NAME } from '@/core/utils';

import { Fragment, ReactNode, useCallback, useContext, useEffect, useState } from 'react';

import { ConfigContext, actions } from './ConfigProvider';

export interface ConfigLoaderProps {
  children: ReactNode;
}

export const ConfigLoader = (props: ConfigLoaderProps) => {
  const [shouldFetchConfig, setShouldFetchConfig] = useState(false);
  const { config, updateConfig } = useContext(ConfigContext);

  const { data, isSuccess, isLoading } = useGetApplicationInfo({
    trigger: shouldFetchConfig,
    select: (data) => data.data,
  });

  const updateAppConfig = useCallback(
    (config: NonNullable<typeof data>) => {
      updateConfig(
        actions.createAppInfoUpdateAction({
          name: config.title,
          description: config.description,
          config_loader_state: 'loaded',
        }),
      );
    },
    [updateConfig],
  );

  useEffect(() => {
    const configScript = document.scripts.namedItem(CONFIG_SCRIPT_NAME);
    const content = configScript?.textContent;

    if (!content) return setShouldFetchConfig(true);

    const config = JSON.parse(content) as NonNullable<typeof data>;

    updateAppConfig(config);
  }, [updateAppConfig]);

  useEffect(() => {
    if (!isSuccess && isLoading) return;

    if (!isSuccess && !isLoading) {
      const prevConfig = config.application_config;
      return void updateAppConfig({ title: prevConfig.name, description: prevConfig.description, version: '1.0' });
    }

    updateAppConfig(data);
  }, [config.application_config, data, isLoading, isSuccess, updateAppConfig]);

  return <Fragment>{props.children}</Fragment>;
};
