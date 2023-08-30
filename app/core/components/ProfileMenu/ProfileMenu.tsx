'use client';

import { Avatar, HStack, StackProps } from '@/chakra-ui/react';

import { fullname } from '@/core/utils';

import { useContext } from 'react';

import { ConfigContext } from '../Providers';
import { Typography } from '../Typography';

export interface ProfileMenuProps extends StackProps {
  name?: string;
}

export const ProfileMenu = ({ name, ...rest }: ProfileMenuProps) => {
  const { config } = useContext(ConfigContext);
  const user = config.session.user_account?.user;
  const fname = name ? name : user ? fullname(user) : '';

  return (
    <HStack
      ps={2}
      pe={16}
      py={2}
      backdropFilter="auto"
      backdropBlur="xl"
      backdropSaturate="180%"
      bgColor="whiteAlpha.300"
      borderRadius="full"
      width={{ base: 'auto', lg: 250 }}
      _hover={{ bgColor: 'whiteAlpha.400' }}
      {...rest}
    >
      <Avatar name={fname} size={{ base: 'sm', lg: 'md' }} />

      <Typography fontWeight={600} color="gray.100">
        {fname}
      </Typography>
    </HStack>
  );
};
