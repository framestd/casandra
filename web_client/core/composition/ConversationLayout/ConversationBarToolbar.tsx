'use client';

import { Box, forwardRef, HStack, Icon, IconButton, Input, StackProps, useColorModeValue } from '@/chakra-ui/react';

import Link from 'next/link';
import { TbMessagePlus } from 'react-icons/tb';

import { backdropFactory } from '@/core/theme';
import { CONVERSATIONS } from '@/core/utils/routes';

import { useThemeConstants } from '../hooks';

export interface ConversationBarToolbarProps extends StackProps {
  filter?: string;
  onFilterChange?(filter: string | undefined): void;
}

export const ConversationBarToolbar = forwardRef(
  ({ filter, onFilterChange, ...rest }: ConversationBarToolbarProps, ref) => {
    const bgColor = useColorModeValue('whiteAlpha.500', 'whiteAlpha.200');
    const buttonColorScheme = useColorModeValue('blackAlpha', 'whiteAlpha');
    // dark mode value is undefined 'cause the default dark mode one is visible enough
    const lightModeVisibleBorderColor = useColorModeValue('gray.300', undefined);
    const inputHoverBorderColor = useColorModeValue('gray.400', 'whiteAlpha.400');
    const inputFocusBorderColor = useColorModeValue('gray.500', 'whiteAlpha.500');
    const { blended_c } = useThemeConstants();

    return (
      <HStack
        ps={4}
        pe={2}
        pt={8}
        pb={2}
        top={0}
        ref={ref}
        width="full"
        zIndex="banner"
        position="sticky"
        borderBottomWidth={1}
        borderColor={lightModeVisibleBorderColor}
        {...backdropFactory({ bgColor })}
        {...rest}
      >
        <Box width="full">
          <Input
            size="xs"
            type="search"
            borderRadius="lg"
            name="conversation_subject"
            focusBorderColor="transparent"
            placeholder="Search conversations"
            borderColor={lightModeVisibleBorderColor}
            value={filter}
            onChange={(e) => onFilterChange?.(e.target.value || undefined)}
            _hover={{ borderColor: inputHoverBorderColor }}
            _focusVisible={{ borderColor: inputFocusBorderColor }}
          />
        </Box>

        <IconButton
          as={Link}
          aria-label="New conversation"
          size="sm"
          variant="ghost"
          color={blended_c}
          colorScheme={buttonColorScheme}
          href={`${CONVERSATIONS}/new`}
          icon={<Icon as={TbMessagePlus} fontSize="lg" />}
        />
      </HStack>
    );
  },
);
