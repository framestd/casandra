import {
  ButtonProps,
  HStack,
  IconButton,
  Input,
  InputProps,
  StackProps,
  UseNumberInputProps,
  useColorModeValue,
  useNumberInput,
} from '@/chakra-ui/react';
import { useThemeConstants } from '@/core/composition/hooks';

export interface NumberInputProps extends UseNumberInputProps {
  InputProps?: InputProps;
  ButtonProps?: ButtonProps;
  RootProps?: StackProps;
}

export const NumberInput = ({ ButtonProps, InputProps, RootProps, ...numberInputProps }: NumberInputProps) => {
  const { blended_c } = useThemeConstants();
  const { getInputProps, getIncrementButtonProps, getDecrementButtonProps } = useNumberInput(numberInputProps);

  const inc = getIncrementButtonProps();
  const dec = getDecrementButtonProps();
  const input = getInputProps();

  return (
    <HStack {...RootProps}>
      <IconButton
        {...dec}
        size="xs"
        icon={<>-</>}
        variant="ghost"
        color={blended_c}
        aria-label="decrement"
        colorScheme={useColorModeValue('blackAlpha', 'whiteAlpha')}
        {...ButtonProps}
      >
        -
      </IconButton>
      <Input {...input} {...InputProps} />
      <IconButton
        {...inc}
        size="xs"
        icon={<>+</>}
        variant="ghost"
        color={blended_c}
        aria-label="increment"
        colorScheme={useColorModeValue('blackAlpha', 'whiteAlpha')}
        {...ButtonProps}
      >
        +
      </IconButton>
    </HStack>
  );
};
