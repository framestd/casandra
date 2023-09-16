import { IconProps, useColorModeValue } from '@/chakra-ui/react';

import { IconType } from 'react-icons';
import { BsCheck2Circle, BsInfoCircle } from 'react-icons/bs';
import { IoAlertCircleOutline, IoWarningOutline } from 'react-icons/io5';

import { AppToastType } from './AppToast';

export function useToastIcons() {
  const defaultIconColor = useColorModeValue('gray.700', 'gray.300');

  const icons: Record<AppToastType, { icon: IconType; color: IconProps['fill'] }> = {
    default: { icon: BsInfoCircle, color: defaultIconColor },
    info: { icon: BsInfoCircle, color: 'blue.500' },
    warn: { icon: IoWarningOutline, color: 'yellow.500' },
    error: { icon: IoAlertCircleOutline, color: 'red.500' },
    success: { icon: BsCheck2Circle, color: 'green.500' },
  };

  return icons;
}
