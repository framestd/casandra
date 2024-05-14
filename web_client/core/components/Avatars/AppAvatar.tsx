import { Avatar, AvatarProps } from '@/chakra-ui/react';
import { APP_NAME } from '@/core/utils';

export interface AppAvatarProps extends AvatarProps {}

export const AppAvatar = ({ name, src, ...rest }: AppAvatarProps) => {
  const fullname = name ?? APP_NAME;
  const image = src ?? '';
  return <Avatar name={fullname} src={image} userSelect="none" {...rest} />;
};
