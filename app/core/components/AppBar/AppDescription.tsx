'use client';

import { Box, BoxProps, useColorModeValue } from '@/chakra-ui/react';
import { Typography } from '../Typography';

export interface AppDescriptionProps extends BoxProps {
  description?: string;
}

export const AppDescription = ({ description, ...props }: AppDescriptionProps) => {
  return (
    <Box
      textStyle="h5"
      maxWidth={{ base: '75%', sm: '80%', md: '100%' }}
      width={480}
      color={useColorModeValue('blackAlpha.800', 'whiteAlpha.800')}
      {...props}
    >
      <Typography textAlign="center">{description}</Typography>
    </Box>
  );
};
