import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { Account } from '@/client/api';
import { Choose, Path } from '@/core/utils';

import { AppSelector } from '../../store';

export type ConfigState = typeof initialState;

type ConfigStateChoose<Key extends Path<ConfigState>> = Choose<ConfigState, Key>;

type GoogleAPIsConfig = { gis_loaded: boolean; gapi_loaded: boolean };

export interface InitialState {
  account: Account;
  apis: { google: GoogleAPIsConfig };
}

const initialState: InitialState = {
  account: { connected_services: [], meta: {}, user: {} } as unknown as Account,
  apis: {
    google: {
      gis_loaded: false,
      gapi_loaded: false,
    },
  },
};

export const configSlice = createSlice({
  name: 'config',
  initialState,
  reducers: {
    updateAccountConfig: (state, action: PayloadAction<ConfigStateChoose<'account'>>) => {
      state.account = { ...state.account, ...action.payload };
    },
    updateGoogleAPIsConfig: (state, action: PayloadAction<Partial<ConfigStateChoose<'apis.google'>>>) => {
      state.apis.google = { ...state.apis.google, ...action.payload };
    },
  },
});

export const getAccountConfig: AppSelector<ConfigStateChoose<'account'>> = (state) => state.config.account;
export const getGoogleAPIsConfig: AppSelector<ConfigStateChoose<'apis.google'>> = (state) => state.config.apis.google;

export const { updateAccountConfig, updateGoogleAPIsConfig } = configSlice.actions;

export const configReducer = configSlice.reducer;
