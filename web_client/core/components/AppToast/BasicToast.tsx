'use client';

import { Circle, forwardRef, HStack, Icon, IconButton, useColorModeValue, VStack } from '@/chakra-ui/react';

import { rgba } from 'polished';
import { IoCloseOutline } from 'react-icons/io5';

import { getThemeColor } from '@/core/utils';

import { Typography } from '../Typography';
import { AppToastProps } from './AppToast';
import { useToastIcons } from './hooks';
import { useThemeConstants } from '@/core/composition/hooks';
import { backdropFactory } from '@/core/theme';

export interface BasicToastProps extends Pick<AppToastProps, 'type' | 'title' | 'message' | 'icon' | 'closeToast'> {}

export const BasicToast = forwardRef<BasicToastProps, 'div'>(
  ({ icon, message, title, type = 'default', closeToast }, ref) => {
    const { blended_bg } = useThemeConstants();
    const zerothStackBgColor = useColorModeValue('offwhite', 'offblack');
    const icons = useToastIcons();

    return (
      <HStack
        p={2}
        spacing={3}
        boxShadow="lg"
        maxWidth={350}
        borderWidth={1}
        borderRadius="2xl"
        ref={ref}
        _hover={{ bgColor: rgba(getThemeColor(zerothStackBgColor), 0.8) }}
        {...backdropFactory({ bgColor: blended_bg, backdropSaturate: '100%' })}
      >
        {icon ? icon : <Icon as={icons[type].icon} color={icons[type].color} fontSize="2xl" />}

        <VStack alignItems="flex-start" width="full" spacing={0.5}>
          <Typography flexGrow={1} fontSize="sm" fontWeight={600}>
            {title}
          </Typography>

          <Typography variant="sedated" fontSize="sm">
            {message}
          </Typography>
        </VStack>

        <Circle
          as={IconButton}
          aria-label="close"
          alignSelf="flex-start"
          colorScheme="gray"
          icon={<Icon as={IoCloseOutline} />}
          variant="ghost"
          height={6}
          minWidth={6}
          onClick={() => closeToast?.()}
        />
      </HStack>
    );
  },
);
