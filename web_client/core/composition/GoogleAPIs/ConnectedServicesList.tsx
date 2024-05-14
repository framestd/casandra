import { Icon, VStack } from '@/chakra-ui/react';

import { PiPlugsConnectedDuotone } from 'react-icons/pi';
import { TbExternalLink } from 'react-icons/tb';

import { ConnectedServices, ConnectedServicesProviderEnum } from '@/client';

import { AppButton } from '../../components/Button';
import { ContinueToGoogleDrive, OnConnect } from './ContinueToGoogleDrive';
import { useGetProviderTokenForLabelService } from '@/core/services/connected_services';
import { useEffect, useState } from 'react';

export interface ConnectedServicesListProps {
  provider: ConnectedServicesProviderEnum;
  services: ConnectedServices[];
  onConnect: OnConnect;
}

export const ConnectedServicesList = ({ provider, services, onConnect }: ConnectedServicesListProps) => {
  const [selectedLabel, setSelectedLabel] = useState<string>();
  const { data, isSuccess } = useGetProviderTokenForLabelService({
    trigger: selectedLabel !== undefined,
    variables: { provider, label: selectedLabel ?? '' },
    select(data) {
      return data.data;
    },
  });

  useEffect(() => {
    if (!isSuccess || !selectedLabel) return;

    onConnect({ accessToken: data.access_token, label: selectedLabel, provider });
    setSelectedLabel(undefined);
  }, [data?.access_token, isSuccess, onConnect, provider, selectedLabel]);

  if (services.length === 0) return <ContinueToGoogleDrive onConnect={onConnect} />;

  return (
    <VStack width="full" justifyContent="flex-start">
      <AppButton
        size="sm"
        width="full"
        fontWeight={400}
        borderRadius="md"
        justifyContent="flex-start"
        leftIcon={<Icon as={TbExternalLink} />}
      >
        Choose another account
      </AppButton>

      {services.map((service) => {
        return (
          <AppButton
            key={service.id}
            size="sm"
            width="full"
            fontWeight={400}
            borderRadius="md"
            justifyContent="flex-start"
            leftIcon={<Icon as={PiPlugsConnectedDuotone} />}
            _hover={{ bgColor: 'brand.500', color: 'white' }}
            onClick={() => setSelectedLabel(service.label)}
          >
            {`${service.label}`}
          </AppButton>
        );
      })}
    </VStack>
  );
};
