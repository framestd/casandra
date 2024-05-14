'use client';

import { Button, ButtonProps, forwardRef, Icon, useColorModeValue } from '@/chakra-ui/react';

import { Apple } from '../Logos';

export const AppleButton = forwardRef<ButtonProps, 'button'>(({ children, ...props }, ref) => {
  const bgColor = useColorModeValue('black', 'white');
  const color = useColorModeValue('whiteAlpha.900', 'blackAlpha.900');
  const colorScheme = useColorModeValue('blackAlpha', 'whiteAlpha');
  const bgColorHover = useColorModeValue('blackAlpha.800', 'whiteAlpha.800');
  const bgColorActive = useColorModeValue('blackAlpha.900', 'whiteAlpha.900');

  return (
    <Button
      ref={ref}
      color={color}
      fontWeight={500}
      bgColor={bgColor}
      colorScheme={colorScheme}
      leftIcon={<Icon as={Apple} />}
      _hover={{ bgColor: bgColorHover }}
      _active={{ bgColor: bgColorActive }}
      {...props}
    >
      {children}
    </Button>
  );
});
