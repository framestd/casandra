'use client';

import { useContext } from 'react';

import { ConfigContext } from '../Providers';
import { BasicAppBar, BasicAppBarProps } from './BasicAppBar';
import { ToolBar, ToolBarProps } from './ToolBar';

export type AppBarProps = BasicAppBarProps | ToolBarProps;

export const AppBar = ({ title: defaultTitle, type, ...props }: AppBarProps) => {
  const { config } = useContext(ConfigContext);
  const title = defaultTitle || config.application_config.name;

  if (type === 'basic') {
    return <BasicAppBar type={type} title={title} {...props} />;
  }

  return <ToolBar type={type} title={title} {...props} />;
};
