'use client';

import { Box, VStack } from '@/chakra-ui/react';

import { InfinitySpin } from 'react-loader-spinner';

import { getThemeColor } from '@/core/utils';

import { AppName } from '../AppBar/AppName';

import styles from './style.module.scss';

export interface SplashScreenProps {
  title: string;
}

export const SplashScreen = (props: SplashScreenProps) => {
  return (
    <Box className={styles.main}>
      <Box className={styles.center}>
        <AppName textStyle="h2" name={props.title} />
      </Box>

      <VStack width="full" spacing={6}>
        <InfinitySpin width="200" color={getThemeColor('brand.500')} />
      </VStack>

      <Box className={styles.grid}></Box>
    </Box>
  );
};
