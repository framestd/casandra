'use client';

import { forwardRef, Text, TextProps } from '@/chakra-ui/react';

export interface TypographyProps extends TextProps {}

export const Typography = forwardRef<TypographyProps, 'div'>(({ children, ...rest }, ref) => {
  return (
    <Text as="div" ref={ref} {...rest}>
      {children}
    </Text>
  );
});
