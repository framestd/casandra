'use client';

import { useContext } from 'react';

import { Flex, FlexProps, forwardRef, HStack, Icon, Link, useColorModeValue } from '@/chakra-ui/react';

import { actions, ConversationContext } from '@/core/composition/Conversation';
import { GoogleDriveConnector, GoogleDriveConnectorProps } from '@/core/composition/GoogleAPIs';
import { useThemeConstants } from '@/core/composition/hooks';
import { backdropFactory } from '@/core/theme';

import { AppIconButton } from '../Button';
import { BoxInc, Dropbox } from '../Logos';
import { Typography } from '../Typography';

export interface ToolBarProps extends FlexProps {
  type: 'tool';
  title?: string;
}

export const ToolBar = forwardRef(({ title, type, ...props }: ToolBarProps, ref) => {
  const { updateCustomizations } = useContext(ConversationContext);
  const onPickerAction: GoogleDriveConnectorProps['onPickerAction'] = (data, meta) => {
    if (data[google.picker.Response.ACTION] === google.picker.Action.PICKED) {
      data[google.picker.Response.DOCUMENTS].forEach((doc) => {
        const id = doc[google.picker.Document.ID];
        const url = doc[google.picker.Document.URL];
        const title = doc[google.picker.Document.NAME];
        // console.log(doc);
        updateCustomizations(
          actions.addDocument({
            id,
            title,
            url,
            label: meta.label,
            provider: meta.provider,
          }),
        );
      });
    }
  };

  const { blended_bg } = useThemeConstants();
  return (
    <Flex
      px={6}
      py={0}
      ref={ref}
      width="full"
      alignItems="center"
      data-variant={type}
      color={useColorModeValue('blackAlpha.300', 'whiteAlpha.300')}
      {...backdropFactory({ bgColor: blended_bg })}
      {...props}
    >
      <Link href="/" _hover={{ textDecoration: 'none' }}>
        <Typography as="div" textStyle="h6" fontWeight={700} letterSpacing="tighter">
          {title}
        </Typography>
      </Link>

      <HStack ms="auto">
        <GoogleDriveConnector onPickerAction={onPickerAction} />
        <AppIconButton aria-label="Connect Dropbox" icon={<Icon as={Dropbox} />} />
        <AppIconButton aria-label="Connect Box Drive" icon={<Icon as={BoxInc} fontSize="2xl" />} />
      </HStack>
    </Flex>
  );
});
