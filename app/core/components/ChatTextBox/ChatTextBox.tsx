'use client';

import { Box, FlexProps, Flex, SystemStyleObject, Textarea, IconButton, Icon } from '@/chakra-ui/react';
import { ChangeEvent, KeyboardEvent, MouseEvent } from 'react';
import { IoSend } from 'react-icons/io5';

import styles from './index.module.css';

export interface ChatTextBoxProps extends Omit<FlexProps, 'onChange'> {
  value: string;
  onChange?: (message: string) => void;
  onSend?: () => void;
  isSendDisabled?: boolean;
}

export const ChatTextBox = ({ value, isSendDisabled = false, onChange, onSend, ...props }: ChatTextBoxProps) => {
  const sty: SystemStyleObject = {
    py: 0,
    fontSize: 'md',
    gridArea: '1 / 1',
    lineHeight: 'short',
  };

  const handleChange = (evt: ChangeEvent<HTMLTextAreaElement>) => {
    const box = evt.target.parentElement;

    if (!box) return;

    onChange?.(evt.target.value);
  };

  const handleSend = (_evt: MouseEvent<HTMLButtonElement>) => {
    onSend?.();
  };

  const handleKeyDown = (evt: KeyboardEvent) => {
    if (evt.key === 'Enter' && !evt.shiftKey) {
      evt.preventDefault();
      '' !== value.trim() && onSend?.();
    }
  };

  return (
    <Flex
      px={3}
      py={1.5}
      width="full"
      overflow="auto"
      alignItems="center"
      position="relative"
      minHeight="46px"
      maxHeight={`${22 * 9}px`}
      borderRadius="xl"
      borderWidth={1}
      borderStyle="solid"
      className={styles.chat_text_box__wrapper}
      borderColor="gray.500"
      {...props}
    >
      <Box
        width="full"
        display="inline-grid"
        position="relative"
        alignItems="center"
        data-value={value}
        _after={{
          ...sty,
          content: 'attr(data-value) " "',
          visibility: 'hidden',
          whiteSpace: 'pre-wrap',
        }}
      >
        <Textarea
          size="xs"
          px={0}
          rows={1}
          border={0}
          color="gray.100"
          width="full"
          height="full"
          resize="none"
          overflow="auto"
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          focusBorderColor="transparent"
          placeholder="Send a message"
          _placeholder={{ color: 'gray.500' }}
          {...(sty as any)}
        />
      </Box>

      <Box alignSelf="flex-end" ms={3} position="sticky" top={'calc(100% - 2rem)'} right={0}>
        <IconButton
          aria-label="Send"
          size="sm"
          borderRadius="xl"
          colorScheme="brand"
          bgColor="brand.500"
          color="brand.text.500"
          onClick={handleSend}
          isDisabled={isSendDisabled}
        >
          <Icon as={IoSend} />
        </IconButton>
      </Box>
    </Flex>
  );
};
