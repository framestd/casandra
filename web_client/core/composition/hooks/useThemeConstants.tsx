import { useColorModeValue } from '@/chakra-ui/react';

export function useThemeConstants() {
  const blended_c = useColorModeValue('blackAlpha.700', 'whiteAlpha.700');
  const blended_hover_bg = useColorModeValue('blackAlpha.100', 'whiteAlpha.100');
  const blended_active_bg = useColorModeValue('blackAlpha.200', 'whiteAlpha.200');

  return { blended_c, blended_hover_bg, blended_active_bg } as const;
}
