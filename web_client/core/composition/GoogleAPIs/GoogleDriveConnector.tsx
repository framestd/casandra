import { useEffect, useRef, useState } from 'react';

import {
  HStack,
  Icon,
  Popover,
  PopoverContent,
  PopoverHeader,
  PopoverTrigger,
  Portal,
  VStack,
  useColorModeValue,
} from '@/chakra-ui/react';

import { ConnectedServicesProviderEnum } from '@/client';
import { useThemeConstants } from '@/core/composition/hooks';
import { useAppSelector } from '@/core/redux';
import { getGoogleAPIsConfig } from '@/core/redux/features';
import { useGetConnectedServicesByProvider } from '@/core/services/connected_services';
import { isErrorResponse } from '@/core/services/utils';
import { backdropFactory } from '@/core/theme';

import { AppIconButton } from '../../components/Button';
import { GoogleDrive } from '../../components/Logos';
import { Typography } from '../../components/Typography';
import { ConnectedServicesList } from './ConnectedServicesList';
import { GOOGLE_API_KEY, getThemeColor } from '@/core/utils';
import { OnConnect } from './ContinueToGoogleDrive';
import { RotatingLines } from 'react-loader-spinner';

export type OnPickerActionMeta = { label: string; provider: ConnectedServicesProviderEnum };

export interface GoogleDriveConnectorProps {
  onPickerAction: (data: google.picker.ResponseObject, meta: OnPickerActionMeta) => void;
}

export const GoogleDriveConnector = ({ onPickerAction }: GoogleDriveConnectorProps) => {
  const googleapis = useAppSelector(getGoogleAPIsConfig);
  const pickerRef = useRef<google.picker.Picker>();
  const [pickerLoaded, setPickerLoaded] = useState(false);
  const { blended_active_bg } = useThemeConstants();
  const { data, isLoading, isSuccess, error } = useGetConnectedServicesByProvider({
    variables: { provider: ConnectedServicesProviderEnum.GOOGLE },
    select(data) {
      return data.data.data;
    },
  });

  useEffect(() => {
    if (!googleapis.gapi_loaded) return;
    const onPickerLoad = () => setPickerLoaded(true);
    window.gapi.load('picker', onPickerLoad);
  }, [googleapis.gapi_loaded]);

  const provider = ConnectedServicesProviderEnum.GOOGLE;
  const onConnect: OnConnect = ({ accessToken, label }) => {
    if (pickerRef.current === undefined) {
      pickerRef.current = new window.google.picker.PickerBuilder()
        .addView(google.picker.ViewId.DOCS)
        .setOAuthToken(accessToken)
        .setDeveloperKey(GOOGLE_API_KEY)
        .setCallback((data) => onPickerAction(data, { label, provider }))
        .build();
    }
    pickerRef.current.setVisible(true);
  };

  const loaderColor = getThemeColor<string>(useColorModeValue('blackAlpha.800', 'whiteAlpha.800'));

  return (
    <Popover>
      <PopoverTrigger>
        <AppIconButton aria-label="Connect Google Drive" icon={<Icon as={GoogleDrive} />} />
      </PopoverTrigger>

      <Portal>
        <PopoverContent borderRadius="2xl" boxShadow="2xl" {...backdropFactory({ bgColor: blended_active_bg })}>
          {isSuccess && data.length !== 0 && (
            <PopoverHeader>
              <HStack>
                <Icon as={GoogleDrive} />
                <Typography fontWeight={800} fontSize="sm">
                  Connect to Google Drive
                </Typography>
              </HStack>
            </PopoverHeader>
          )}

          <VStack p={3}>
            {(isLoading || !pickerLoaded) && <RotatingLines strokeColor={loaderColor} strokeWidth="4" width="24" />}
            {!isSuccess && <Typography>{isErrorResponse(error) ? error.message : 'Unknown error'}</Typography>}
            {isSuccess && <ConnectedServicesList services={data} provider={provider} onConnect={onConnect} />}
          </VStack>
        </PopoverContent>
      </Portal>
    </Popover>
  );
};
