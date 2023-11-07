'use client';

import { Fragment } from 'react';

import Script from 'next/script';

import { useAppDispatch } from '@/core/redux';
import { updateGoogleAPIsConfig } from '@/core/redux/features';

export type GoogleAPIsType = keyof typeof GoogleAPIsMap;

export interface GoogleAPIsLoaderProps {
  apis?: GoogleAPIsType[];
  onGapiLoad?: () => void;
  onGisLoad?: () => void;
}

export const GoogleAPIsMap = Object.freeze({
  gapi: 'https://apis.google.com/js/api.js',
  gis: 'https://accounts.google.com/gsi/client',
})

export const GoogleAPIsLoader = ({ apis = [], onGapiLoad, onGisLoad }: GoogleAPIsLoaderProps) => {
  const dispatch = useAppDispatch();

  const handleGisLoad = () => {
    dispatch(updateGoogleAPIsConfig({ gis_loaded: true }));
    onGisLoad?.();
  };
  const handleGapiLoad = () => {
    dispatch(updateGoogleAPIsConfig({ gapi_loaded: true }));
    onGapiLoad?.();
  };

  const LoadEventMap: Record<GoogleAPIsType, () => void> = {
    gapi: handleGapiLoad,
    gis: handleGisLoad,
  };

  return (
    <Fragment>
      {apis.map((key) => {
        return <Script key={key} async defer src={GoogleAPIsMap[key]} onLoad={LoadEventMap[key]} />;
      })}
    </Fragment>
  );
};
