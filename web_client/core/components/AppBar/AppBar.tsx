'use client';

import { Link } from '@/chakra-ui/next-js';
import { Flex, FlexProps, useColorModeValue } from '@/chakra-ui/react';

import { APP_BAR_HEIGHT } from '@/core/utils';

import { useContext } from 'react';

import { ConfigContext } from '../Providers';
import { Typography } from '../Typography';

export interface AppBarProps extends FlexProps {
  title?: string;
}

export const AppBar = ({ title, ...props }: AppBarProps) => {
  const { config } = useContext(ConfigContext);

  return (
    <Flex
      p={3}
      alignItems="center"
      height={`${APP_BAR_HEIGHT}px`}
      color={useColorModeValue('blackAlpha.500', 'whiteAlpha.500')}
      {...props}
    >
      <Link href="/" width="full" _hover={{ textDecoration: 'none' }}>
        <Typography as="div" align="center" fontWeight={900} textStyle="h4" width="full" letterSpacing="tighter">
          {title || config.application_config.name}
        </Typography>
      </Link>
    </Flex>
  );
};
