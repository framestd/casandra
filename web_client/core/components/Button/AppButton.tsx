'use client';

import { Button, ButtonProps, forwardRef, useColorModeValue } from '@/chakra-ui/react';

export const AppButton = forwardRef<ButtonProps, 'button'>((props, ref) => {
  const bgColorActive = useColorModeValue('blackAlpha.100', 'whiteAlpha.100');
  const bgColorHover = useColorModeValue('blackAlpha.200', 'whiteAlpha.200');
  const colorScheme = useColorModeValue('blackAlpha', 'whiteAlpha');

  return (
    <Button
      variant="ghost"
      colorScheme={colorScheme}
      color="inherit"
      _hover={{ bgColor: bgColorHover }}
      _active={{ bgColor: bgColorActive }}
      {...props}
      ref={ref}
    />
  );
});
