'use client';

import {
  forwardRef,
  Icon,
  IconButton,
  Input,
  InputGroup,
  InputProps,
  InputRightElement,
  useBreakpointValue,
} from '@/chakra-ui/react';
import { useState } from 'react';
import { BsEye, BsEyeSlash } from 'react-icons/bs';

export interface PasswordInputProps extends InputProps {
  showControls?: boolean;
}

export const PasswordInput = forwardRef<PasswordInputProps, 'input'>(
  ({ showControls = true, size: _size = 'md', ...rest }, ref) => {
    const [passwordVisible, setPasswordVisible] = useState(false);

    const size = useBreakpointValue(typeof _size === 'string' ? { base: _size } : _size, {
      fallback: 'base',
    })!;

    return (
      <InputGroup size={size}>
        <Input type={passwordVisible ? 'text' : 'password'} {...rest} ref={ref} />

        {showControls && (
          <InputRightElement height={size === 'sm' ? 8 : 10}>
            <IconButton
              aria-label={passwordVisible ? 'hide password' : 'show password'}
              variant="ghost"
              borderRadius="full"
              onClick={() => setPasswordVisible((visible) => !visible)}
              _active={{ bgColor: 'transparent' }}
              _hover={{ bgColor: 'transparent' }}
            >
              <Icon as={passwordVisible ? BsEye : BsEyeSlash} />
            </IconButton>
          </InputRightElement>
        )}
      </InputGroup>
    );
  },
);
