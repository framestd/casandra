'use client';

import { Link } from '@/chakra-ui/next-js';
import { Flex, FlexProps, useColorModeValue } from '@/chakra-ui/react';

import { APP_BAR_HEIGHT } from '@/core/utils';

import { Typography } from '../Typography';

export interface ToolBarProps extends FlexProps {
  type: 'tool';
  title?: string;
}

export const ToolBar = ({ type, title, ...props }: ToolBarProps) => {
  return (
    <Flex
      px={6}
      py={3}
      alignItems="center"
      height={`${APP_BAR_HEIGHT}px`}
      color={useColorModeValue('blackAlpha.500', 'whiteAlpha.500')}
      data-variant={type}
      {...props}
    >
      <Link href="/" width="full" _hover={{ textDecoration: 'none' }}>
        <Typography as="div" fontWeight={900} textStyle="h4" width="full" letterSpacing="tighter">
          {title}
        </Typography>
      </Link>
    </Flex>
  );
};
