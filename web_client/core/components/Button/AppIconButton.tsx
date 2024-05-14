'use client';

import { IconButton, IconButtonProps, forwardRef, useColorModeValue } from '@/chakra-ui/react';

export const AppIconButton = forwardRef<IconButtonProps, 'button'>((props, ref) => {
  const bgColorActive = useColorModeValue('blackAlpha.100', 'whiteAlpha.100');
  const bgColorHover = useColorModeValue('blackAlpha.200', 'whiteAlpha.200');
  const colorScheme = useColorModeValue('blackAlpha', 'whiteAlpha');

  return (
    <IconButton
      variant="ghost"
      borderRadius="full"
      colorScheme={colorScheme}
      _hover={{ bgColor: bgColorHover }}
      _active={{ bgColor: bgColorActive }}
      {...props}
      ref={ref}
    />
  );
});
