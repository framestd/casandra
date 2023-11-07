'use client';

import { useEffect, useRef } from 'react';

import { Icon, StackProps, VStack } from '@/chakra-ui/react';

import { useAppSelector } from '@/core/redux';
import { getGoogleAPIsConfig } from '@/core/redux/features';
import { useCreateConnectedServicesService } from '@/core/services/connected_services';
import { APP_NAME, GOOGLE_ID } from '@/core/utils';
import { GoogleScopes } from '@/core/utils/oauth';

import { GoogleButton } from '../../components/Button';
import { GoogleDrive } from '../../components/Logos';
import { Typography } from '../../components/Typography';
import { ConnectedServicesProviderEnum } from '@/client';

export type OnConnectData = { accessToken: string; label: string; provider: ConnectedServicesProviderEnum };
export type OnConnect = (data: OnConnectData) => void;

export interface ContinueToGoogleDriveProps extends StackProps {
  onConnect: OnConnect;
}

export const ContinueToGoogleDrive = ({ onConnect, ...props }: ContinueToGoogleDriveProps) => {
  const codeClientRef = useRef<google.accounts.oauth2.CodeClient>();
  const googleapis = useAppSelector(getGoogleAPIsConfig);

  const createConnectedServiceHandler = useCreateConnectedServicesService();

  useEffect(() => {
    if (!googleapis.gis_loaded) return;
    codeClientRef.current = window.google.accounts.oauth2.initCodeClient({
      client_id: GOOGLE_ID,
      scope: GoogleScopes.DRIVE_READONLY,
      ux_mode: 'popup',
      callback(response) {
        if (response.error !== undefined) throw response;
        createConnectedServiceHandler
          .mutateAsync({
            code: response.code,
            scopes: [GoogleScopes.DRIVE_READONLY],
            state: response.state,
            redirect_uri: 'postmessage',
          })
          .then((res) => {
            const { access_token, label } = res.data.data;
            onConnect({
              accessToken: access_token,
              label: label,
              provider: ConnectedServicesProviderEnum.GOOGLE,
            });
          });
      },
    });
  }, [createConnectedServiceHandler, googleapis.gis_loaded, onConnect]);

  return (
    <VStack spacing={4} {...props}>
      <Icon as={GoogleDrive} />

      <Typography fontSize="sm" textAlign="center" fontWeight={500}>
        You need to grant <strong>{APP_NAME}</strong> access to your Google Drive to continue
      </Typography>

      <GoogleButton
        size="sm"
        onClick={() => codeClientRef.current?.requestCode()}
        isDisabled={!googleapis.gis_loaded || !googleapis.gapi_loaded}
      >
        Continue with Google
      </GoogleButton>
    </VStack>
  );
};
