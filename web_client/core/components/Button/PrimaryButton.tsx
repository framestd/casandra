'use client';

import { Button, ButtonProps, forwardRef } from '@/chakra-ui/react';

export const PrimaryButton = forwardRef<ButtonProps, 'button'>(({ children, ...props }, ref) => {
  return (
    <Button
      colorScheme="brand"
      color="gray.100"
      bgColor="brand.600"
      ref={ref}
      _hover={{ bgColor: 'brand.700' }}
      _active={{ bgColor: 'brand.800' }}
      {...props}
    >
      {children}
    </Button>
  );
});
