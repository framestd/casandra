'use client';

import { useContext } from 'react';

import { forwardRef } from '@chakra-ui/react';

import { ConfigContext } from '../Providers';
import { BasicAppBar, BasicAppBarProps } from './BasicAppBar';
import { ToolBar, ToolBarProps } from './ToolBar';

export type AppBarProps = BasicAppBarProps | ToolBarProps;

export const AppBar = forwardRef<AppBarProps, 'div'>(({ title: defaultTitle, type, ...props }, ref) => {
  const { config } = useContext(ConfigContext);
  const title = defaultTitle || config.application_config.name;

  if (type === 'basic') {
    return <BasicAppBar type={type} title={title} ref={ref} {...props} />;
  }

  return <ToolBar type={type} title={title} ref={ref} {...props} />;
});
