'use client';

import { Box, VStack } from '@/chakra-ui/react';

import { getThemeColor } from '@/core/utils';

import { InfinitySpin } from 'react-loader-spinner';

import { styles } from './SplashScreenStyles';

import { AppName } from '../AppBar/AppName';

export interface SplashScreenProps {
  title: string;
}

export const SplashScreen = (props: SplashScreenProps) => {
  return (
    <Box css={styles.main}>
      <Box css={styles.center}>
        <AppName textStyle="h2" name={props.title} />
      </Box>

      <VStack width="full" spacing={6}>
        <InfinitySpin width="200" color={getThemeColor('brand.500')} />
      </VStack>

      <Box css={styles.grid}></Box>
    </Box>
  );
};
