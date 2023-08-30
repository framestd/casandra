'use client';

import { Account } from '@/client';
import { APP_NAME } from '@/core/utils';

import { produce } from 'immer';
import { Dispatch, ReactNode, createContext, useMemo, useReducer } from 'react';

export type ConfigLoadingState = 'loaded' | 'loading' | 'reloading';

export interface ApplicationConfig {
  name: string;
  description: string;
  config_loader_state: ConfigLoadingState;
}

export interface SessionContext {
  user_account: Account | null;
}

export interface Config {
  application_config: ApplicationConfig;
  has_active_session: boolean;
  session: SessionContext;
  session_loader_state: ConfigLoadingState;
}

export interface ConfigContext {
  config: Config;
  updateConfig: Dispatch<Actions>;
}

export interface ConfigProviderProps {
  children: ReactNode;
}

export interface UpdateAppInfoAction {
  type: ActionType.UPDATE_APPLICATION_INFO;
  payload: ApplicationConfig;
}

export interface UpdateUserAccountAction {
  type: ActionType.UPDATE_USER_ACCOUNT;
  payload: Account | null;
}

export interface UpdateHasActiveSessionAction {
  type: ActionType.UPDATE_HAS_ACTIVE_SESSION;
  payload: boolean;
}

export interface UpdateSessionLoaderStateAction {
  type: ActionType.UPDATE_SESSION_LOADER_STATE;
  payload: ConfigLoadingState;
}

export enum ActionType {
  UPDATE_APPLICATION_INFO = 'update_application_info',
  UPDATE_USER_ACCOUNT = 'update_user_account',
  UPDATE_HAS_ACTIVE_SESSION = 'update_has_active_session',
  UPDATE_SESSION_LOADER_STATE = 'update_session_loader_state',
}

export type Actions =
  | UpdateAppInfoAction
  | UpdateHasActiveSessionAction
  | UpdateSessionLoaderStateAction
  | UpdateUserAccountAction;

class ConfigContextActions {
  createAppInfoUpdateAction(info: ApplicationConfig): UpdateAppInfoAction {
    return { type: ActionType.UPDATE_APPLICATION_INFO, payload: info };
  }

  createUserAccountUpdateAction(account: Account | null): UpdateUserAccountAction {
    return { type: ActionType.UPDATE_USER_ACCOUNT, payload: account };
  }

  createHasActiveSessionUpdateAction(hasActiveSession: boolean): UpdateHasActiveSessionAction {
    return { type: ActionType.UPDATE_HAS_ACTIVE_SESSION, payload: hasActiveSession };
  }

  createSessionLoaderStateUpdateAction(sessionLoaderState: ConfigLoadingState): UpdateSessionLoaderStateAction {
    return { type: ActionType.UPDATE_SESSION_LOADER_STATE, payload: sessionLoaderState };
  }
}

export const actions = new ConfigContextActions();

const defaultContext: ConfigContext = {
  config: {
    application_config: { name: APP_NAME, description: '', config_loader_state: 'loading' },
    has_active_session: false,
    session: { user_account: null },
    session_loader_state: 'loading',
  },
  updateConfig: () => void 0,
};

function reducer(state: Config, action: Actions) {
  switch (action.type) {
    case ActionType.UPDATE_APPLICATION_INFO: {
      const nextState = produce(state, (draft) => void (draft.application_config = action.payload));
      return nextState;
    }

    case ActionType.UPDATE_USER_ACCOUNT: {
      const nextState = produce(state, (draft) => void (draft.session.user_account = action.payload));
      return nextState;
    }

    case ActionType.UPDATE_HAS_ACTIVE_SESSION: {
      const nextState = produce(state, (draft) => void (draft.has_active_session = action.payload));
      return nextState;
    }

    case ActionType.UPDATE_SESSION_LOADER_STATE: {
      const nextState = produce(state, (draft) => void (draft.session_loader_state = action.payload));
      return nextState;
    }

    default:
      return state;
  }
}

export const ConfigContext = createContext<ConfigContext>(defaultContext);

export const ConfigProvider = (props: ConfigProviderProps) => {
  const [state, dispacth] = useReducer(reducer, defaultContext.config);

  const context = useMemo(() => ({ config: state, updateConfig: dispacth }), [state]);

  return <ConfigContext.Provider value={context}>{props.children}</ConfigContext.Provider>;
};
