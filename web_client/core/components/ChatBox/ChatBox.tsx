'use client';

import { ReactNode } from 'react';

import { Flex, FlexProps } from '@/chakra-ui/react';

import { useThemeConstants } from '@/core/composition/hooks';
import { backdropFactory } from '@/core/theme';
import { APP_BAR_HEIGHT } from '@/core/utils';

export interface ChatBoxProps extends FlexProps {
  children: ReactNode;
}

export const ChatBox = ({ children, ...rest }: ChatBoxProps) => {
  const { blended_bg } = useThemeConstants();

  return (
    <Flex
      position="absolute"
      borderTopRadius="2xl"
      width={700}
      maxWidth="full"
      height={`calc(100% - ${APP_BAR_HEIGHT}px)`}
      top={`${APP_BAR_HEIGHT}px`}
      {...backdropFactory({ bgColor: blended_bg })}
      {...rest}
    >
      {children}
    </Flex>
  );
};
