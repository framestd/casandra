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
    const { blended_c, input_focus_br_c, input_hover_br_c, light_mode_visible_br_c } = useThemeConstants();

    return (
      <HStack
        ps={4}
        pe={2}
        pt={8}
        pb={2}
        top={0}
        ref={ref}
        width="full"
        zIndex="docked"
        position="sticky"
        borderBottomWidth={1}
        borderColor={light_mode_visible_br_c}
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
            borderColor={light_mode_visible_br_c}
            value={filter}
            onChange={(e) => onFilterChange?.(e.target.value || undefined)}
            _hover={{ borderColor: input_focus_br_c }}
            _focusVisible={{ borderColor: input_hover_br_c }}
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
