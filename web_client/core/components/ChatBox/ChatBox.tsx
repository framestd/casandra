'use client';

import { ReactNode } from 'react';

import { Flex, FlexProps, useColorModeValue } from '@/chakra-ui/react';

import { backdropFactory } from '@/core/theme';
import { APP_BAR_HEIGHT } from '@/core/utils';

export interface ChatBoxProps extends FlexProps {
  children: ReactNode;
}

export const ChatBox = ({ children, ...rest }: ChatBoxProps) => {
  const bgColor = useColorModeValue('whiteAlpha.500', 'whiteAlpha.200');

  return (
    <Flex
      position="absolute"
      borderTopRadius="2xl"
      width={700}
      maxWidth="full"
      height={`calc(100% - ${APP_BAR_HEIGHT}px)`}
      top={`${APP_BAR_HEIGHT}px`}
      {...backdropFactory({ bgColor })}
      {...rest}
    >
      {children}
    </Flex>
  );
};
