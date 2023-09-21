import { Box, HStack, Icon, IconButton, Input, Link, StackProps, useColorModeValue } from '@/chakra-ui/react';

import { TbMessagePlus } from 'react-icons/tb';

import { backdropFactory } from '@/core/theme';
import { CONVERSATIONS } from '@/core/utils/routes';

import { useThemeConstants } from '../hooks';

export interface ConversationBarToolbarProps extends StackProps {
  filter?: string;
  onFilterChange?(filter: string | undefined): void;
}

export const ConversationBarToolbar = ({ filter, onFilterChange, ...rest }: ConversationBarToolbarProps) => {
  const bgColor = useColorModeValue('whiteAlpha.500', 'whiteAlpha.200');
  const buttonColorScheme = useColorModeValue('blackAlpha', 'whiteAlpha');
  const { blended_c } = useThemeConstants();

  return (
    <HStack
      ps={4}
      pe={2}
      pt={8}
      pb={2}
      top={0}
      width="full"
      zIndex="banner"
      position="sticky"
      borderBottomWidth={1}
      {...backdropFactory({ bgColor })}
      {...rest}
    >
      <Box width="full">
        <Input
          size="xs"
          borderRadius="lg"
          placeholder="Search conversations"
          focusBorderColor="transparent"
          value={filter}
          _focusVisible={{ borderColor: 'gray.500' }}
          onChange={(e) => onFilterChange?.(e.target.value || undefined)}
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
};
