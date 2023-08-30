import { Flex, FlexProps } from '@/chakra-ui/react';
import { APP_BAR_HEIGHT } from '@/core/utils';

import { ReactNode } from 'react';

export interface ChatBoxProps extends FlexProps {
  children: ReactNode;
}

export const ChatBox = ({ children, ...rest }: ChatBoxProps) => {
  return (
    <Flex
      backdropFilter="auto"
      backdropBlur="xl"
      backdropSaturate="180%"
      bgColor="whiteAlpha.300"
      position="absolute"
      borderTopRadius="2xl"
      width={700}
      maxWidth="full"
      height={`calc(100% - ${APP_BAR_HEIGHT}px)`}
      top={`${APP_BAR_HEIGHT}px`}
      {...rest}
    >
      {children}
    </Flex>
  );
};
