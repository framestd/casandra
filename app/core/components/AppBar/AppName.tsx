'use client';

import { Flex, FlexProps, useColorModeValue } from '@/chakra-ui/react';

import { APP_NAME } from '@/core/utils';

import { Typography } from '../Typography';

export interface AppNameProps extends FlexProps {
  name?: string;
}

export const AppName = ({ name = APP_NAME, ...props }: AppNameProps) => {
  return (
    <Flex
      p={3}
      alignItems="center"
      color={useColorModeValue('blackAlpha.500', 'whiteAlpha.500')}
      textStyle="h4"
      {...props}
    >
      <Typography
        as="div"
        align="center"
        color="inherit"
        fontWeight={900}
        width="full"
        letterSpacing="tighter"
        userSelect="none"
      >
        {name}
      </Typography>
    </Flex>
  );
};
