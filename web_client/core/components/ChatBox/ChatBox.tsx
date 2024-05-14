'use client';

import { ReactNode } from 'react';

import { Flex, FlexProps } from '@/chakra-ui/react';

import { useThemeConstants } from '@/core/composition/hooks';
import { backdropFactory } from '@/core/theme';

export interface ChatBoxProps extends FlexProps {
  children: ReactNode;
}

export const ChatBox = ({ children, ...rest }: ChatBoxProps) => {
  const { blended_bg } = useThemeConstants();

  return (
    <Flex
      height="full"
      flex="1 1 auto"
      borderTopRadius={{ lg: '2xl' }}
      {...backdropFactory({ bgColor: blended_bg })}
      {...rest}
    >
      {children}
    </Flex>
  );
};
