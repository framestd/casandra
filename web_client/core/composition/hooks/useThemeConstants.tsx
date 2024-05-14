import { useColorModeValue } from '@/chakra-ui/react';

export function useThemeConstants() {
  const blended_c = useColorModeValue('blackAlpha.700', 'whiteAlpha.700');
  const blended_bg = useColorModeValue('whiteAlpha.500', 'whiteAlpha.200');
  const blended_hover_bg = useColorModeValue('blackAlpha.100', 'whiteAlpha.100');
  const blended_active_bg = useColorModeValue('blackAlpha.200', 'whiteAlpha.200');

  const input_hover_br_c = useColorModeValue('gray.400', 'whiteAlpha.400');
  const input_focus_br_c = useColorModeValue('gray.500', 'whiteAlpha.500');

  // dark mode value is undefined 'cause the default dark mode one is visible enough
  const light_mode_visible_br_c = useColorModeValue('gray.300', undefined);

  return {
    blended_c,
    blended_bg,
    blended_hover_bg,
    blended_active_bg,
    input_hover_br_c,
    input_focus_br_c,
    light_mode_visible_br_c,
  } as const;
}
