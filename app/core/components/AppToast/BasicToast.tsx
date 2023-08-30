'use client';

import { Circle, forwardRef, HStack, Icon, IconButton, useColorModeValue, VStack } from '@/chakra-ui/react';

import { getThemeColor } from '@/core/utils';

import { rgba } from 'polished';
import { IoCloseOutline } from 'react-icons/io5';

import { Typography } from '../Typography';
import { AppToastProps } from './AppToast';
import { useToastIcons } from './hooks';

export interface BasicToastProps extends Pick<AppToastProps, 'type' | 'title' | 'message' | 'icon' | 'closeToast'> {}

export const BasicToast = forwardRef<BasicToastProps, 'div'>(
  ({ icon, message, title, type = 'default', closeToast }, ref) => {
    const modalBgColor = useColorModeValue('offwhiteAlpha', 'offblackAlpha');
    const zerothStackBgColor = useColorModeValue('offwhite', 'offblack');
    const icons = useToastIcons();

    return (
      <HStack
        boxShadow="lg"
        bgColor={modalBgColor}
        backdropSaturate="180%"
        backdropFilter="auto"
        backdropBlur="xl"
        borderRadius="2xl"
        maxWidth={350}
        spacing={3}
        p={2}
        _hover={{ bgColor: rgba(getThemeColor(zerothStackBgColor), 0.8) }}
        ref={ref}
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
