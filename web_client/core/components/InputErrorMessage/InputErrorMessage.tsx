import { Box, FormErrorMessage, FormErrorMessageProps, HStack, Icon } from '@/chakra-ui/react';

import { BiErrorCircle } from 'react-icons/bi';

export interface InputErrorMessage extends FormErrorMessageProps {
  message?: string;
}

export const InputErrorMessage = ({ children, message, ...rest }: InputErrorMessage) => {
  return (
    <FormErrorMessage fontSize="xs" {...rest}>
      <HStack>
        <Icon as={BiErrorCircle} />

        <Box>{message || children}</Box>
      </HStack>
    </FormErrorMessage>
  );
};
