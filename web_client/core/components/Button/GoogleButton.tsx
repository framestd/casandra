'use client';

import { Button, ButtonProps, forwardRef, Icon, useColorModeValue } from '@/chakra-ui/react';

import localFont from 'next/font/local';

import { Google } from '../Logos';

const GoogleSans = localFont({
  src: [
    { path: '../../../public/fonts/GoogleSans-Regular.ttf', weight: '400', style: 'normal' },
    { path: '../../../public/fonts/GoogleSans-Medium.ttf', weight: '500', style: 'normal' },
  ],
});

export const GoogleButton = forwardRef<ButtonProps, 'button'>(({ children, ...props }, ref) => {
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
      className={GoogleSans.className}
      leftIcon={<Icon as={Google} />}
      _hover={{ bgColor: bgColorHover }}
      _active={{ bgColor: bgColorActive }}
      {...props}
    >
      {children}
    </Button>
  );
});
