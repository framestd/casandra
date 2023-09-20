'use client';

import { ChangeEvent, KeyboardEvent, MouseEvent, useState } from 'react';

import { Box, Flex, FlexProps, Icon, IconButton, SystemStyleObject, Textarea } from '@/chakra-ui/react';

import { IoSend } from 'react-icons/io5';


export interface ChatTextBoxProps extends Omit<FlexProps, 'onChange'> {
  value?: string;
  onSend?: (message: string) => void;
  isSending?: boolean;
}

export const ChatTextBox = ({ value, isSending = false, onSend, ...props }: ChatTextBoxProps) => {
  const [textValue, setTextValue] = useState(() => value || '');
  const sty: SystemStyleObject = {
    py: 0,
    fontSize: 'md',
    gridArea: '1 / 1',
    lineHeight: 'short',
  };

  const handleChange = (evt: ChangeEvent<HTMLTextAreaElement>) => {
    const box = evt.target.parentElement;

    if (!box) return;

    box.scrollTo({ top: box.scrollHeight, behavior: 'smooth' });

    setTextValue(evt.target.value);
  };

  const handleSend = (_evt: MouseEvent<HTMLButtonElement>) => {
    setTextValue('');
    onSend?.(textValue.trim());
  };

  const handleKeyDown = (evt: KeyboardEvent) => {
    if (evt.key === 'Enter' && !evt.shiftKey) {
      evt.preventDefault();
      if ('' !== textValue.trim()) {
        setTextValue('');
        onSend?.(textValue.trim());
      }
    }
  };

  return (
    <Flex
      px={3}
      py={1.5}
      width="full"
      overflow="auto"
      alignItems="flex-start"
      position="relative"
      minHeight="46px"
      maxHeight={`${22 * 9}px`}
      borderRadius="xl"
      borderWidth={1}
      borderStyle="solid"
      borderColor="gray.500"
      {...props}
    >
      <Box
        my="auto"
        width="full"
        display="inline-grid"
        position="relative"
        alignItems="center"
        data-value={textValue}
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
          width="full"
          height="full"
          resize="none"
          overflow="auto"
          value={textValue}
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
          isDisabled={isSending || textValue.trim() === ''}
        >
          <Icon as={IoSend} />
        </IconButton>
      </Box>
    </Flex>
  );
};
