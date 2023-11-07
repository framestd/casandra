import { Avatar, AvatarProps, forwardRef } from '@/chakra-ui/react';

import { useAppSession } from '@/core/composition/hooks';

export interface UserAvatarProps extends AvatarProps {}

export const UserAvatar = forwardRef<UserAvatarProps, 'span'>(({ name, src, ...rest }, ref) => {
  const session = useAppSession();
  const fullname = name ?? session.data?.user.name ?? '';
  const image = src ?? session.data?.user.image ?? '';
  return <Avatar ref={ref} name={fullname} src={image} userSelect="none" {...rest} />;
});
