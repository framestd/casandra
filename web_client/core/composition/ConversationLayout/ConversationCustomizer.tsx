import { useContext, useMemo } from 'react';

import { HStack, Icon, InputProps, Switch, VStack } from '@/chakra-ui/react';

import { BsLayoutTextSidebar } from 'react-icons/bs';

import { AppIconButton } from '@/core/components/Button';
import { NumberInput } from '@/core/components/Input';
import { Typography } from '@/core/components/Typography';
import { backdropFactory } from '@/core/theme';

import { actions, ConversationContext } from '../Conversation';
import { useThemeConstants } from '../hooks';

export interface ConversationCustomizerProps {}

export const ConversationCustomizer = () => {
  const { blended_bg, blended_c, input_focus_br_c, input_hover_br_c, light_mode_visible_br_c } = useThemeConstants();

  const { updateCustomizations, context_size, incognito } = useContext(ConversationContext);

  const inputProps = useMemo<InputProps>(() => {
    return {
      size: 'xs',
      fontSize: 'sm',
      borderRadius: 'lg',
      name: 'context-size',
      fontFamily: 'monospace',
      focusBorderColor: 'transparent',
      width: 'calc(1.25ch + (0.5rem * 2))',
      borderColor: light_mode_visible_br_c,
      _hover: { borderColor: input_hover_br_c },
      _focus: { borderColor: input_focus_br_c },
    };
  }, [input_focus_br_c, input_hover_br_c, light_mode_visible_br_c]);

  return (
    <VStack
      width="full"
      height="full"
      borderRadius="2xl"
      alignItems="flex-start"
      {...backdropFactory({ bgColor: blended_bg })}
    >
      <HStack
        px={4}
        py={2}
        width="full"
        borderBottomWidth={1}
        justifyContent="space-between"
        borderColor={light_mode_visible_br_c}
      >
        <Typography fontSize="sm" fontWeight={600}>
          Customize
        </Typography>

        <AppIconButton
          aria-label="Toggle sidebar"
          size="sm"
          color={blended_c}
          icon={<Icon as={BsLayoutTextSidebar} />}
        />
      </HStack>

      <VStack px={2} alignItems="flex-start" width="full">
        <HStack py={1.5} px={2} width="full" bgColor={blended_bg} borderRadius="xl">
          <Typography fontSize="sm" flexGrow={1} color={blended_c} whiteSpace="nowrap" fontWeight={500}>
            Incognito
          </Typography>

          <Switch
            colorScheme="brand"
            isChecked={incognito}
            onChange={(e) => updateCustomizations(actions.toggleIncognito(e.target.checked))}
            sx={{ '& > span[data-checked]': { '--switch-bg': 'var(--chakra-colors-brand-500) !important' } }}
          />
        </HStack>

        <HStack py={1.5} px={2} width="full" bgColor={blended_bg} borderRadius="xl">
          <Typography fontSize="sm" flexGrow={1} color={blended_c} whiteSpace="nowrap" fontWeight={500}>
            Context Size:
          </Typography>

          <NumberInput
            min={0}
            max={6}
            value={context_size ?? 2}
            InputProps={inputProps}
            RootProps={{ justifySelf: 'flex-end' }}
            onChange={(_, vn) => updateCustomizations(actions.setContextSize(vn))}
          />
        </HStack>
      </VStack>
    </VStack>
  );
};
