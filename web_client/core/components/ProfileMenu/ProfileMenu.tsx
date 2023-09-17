'use client';

import { useContext } from 'react';

import { Avatar, HStack, StackProps } from '@/chakra-ui/react';

import { backdropFactory } from '@/core/theme';
import { fullname } from '@/core/utils';

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
      borderRadius="full"
      width="full"
      _hover={{ bgColor: 'whiteAlpha.400' }}
      {...backdropFactory({ bgColor: 'whiteAlpha.200' })}
      {...rest}
    >
      <Avatar name={fname} size={{ base: 'sm', lg: 'md' }} />

      <Typography fontWeight={600}>{fname}</Typography>
    </HStack>
  );
};
