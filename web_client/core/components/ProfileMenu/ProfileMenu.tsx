'use client';

import { Box, HStack, Popover, PopoverContent, PopoverTrigger, StackProps, VStack } from '@/chakra-ui/react';

import NextLink from 'next/link';

import { useThemeConstants } from '@/core/composition/hooks';
import { backdropFactory } from '@/core/theme';

import { Typography } from '../Typography';
import { UserAvatar } from '../Avatars';
import { AppButton } from '../Button';
import { appEventAdapter } from '@/core/services/events';
import { Routes } from '@/core/utils/routes';

export interface ProfileMenuProps extends StackProps {
  name?: string;
  image?: string;
}

export const ProfileMenu = ({ name, image, ...rest }: ProfileMenuProps) => {
  const { blended_bg, blended_hover_bg } = useThemeConstants();

  return (
    <Box width="full">
      <Popover matchWidth={true}>
        <PopoverTrigger>
          <HStack
            ps={2}
            pe={2}
            py={2}
            width="full"
            role="button"
            tabIndex={0}
            borderRadius="full"
            _hover={{ bgColor: blended_hover_bg }}
            {...backdropFactory({ bgColor: blended_bg })}
            {...rest}
          >
            <UserAvatar src={image} size={{ base: 'sm', lg: 'md' }} />

            <Typography fontWeight={600} isTruncated={true}>
              {name}
            </Typography>
          </HStack>
        </PopoverTrigger>

        <PopoverContent width="auto" overflow="hidden" {...backdropFactory({ bgColor: blended_bg })}>
          <VStack spacing={0}>
            <AppButton
              as={NextLink}
              href={Routes.SETTINGS}
              size="sm"
              width="full"
              borderRadius={0}
              borderBottomWidth={1}
              justifyContent="flex-start"
            >
              Settings
            </AppButton>
            <AppButton
              size="sm"
              width="full"
              borderRadius={0}
              justifyContent="flex-start"
              onClick={() => appEventAdapter.trigger('signout')}
            >
              Sign out
            </AppButton>
          </VStack>
        </PopoverContent>
      </Popover>
    </Box>
  );
};
