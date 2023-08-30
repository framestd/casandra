import { FormLabel, FormLabelProps } from '@/chakra-ui/react';

export interface InputLabelProps extends FormLabelProps {}

export const InputLabel = ({ children, ...rest }: InputLabelProps) => {
  return (
    <FormLabel color="gray.500" fontSize="sm" {...rest}>
      {children}
    </FormLabel>
  );
};
