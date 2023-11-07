'use client';

import { createContext, Dispatch, ReactNode, useMemo, useReducer } from 'react';

import { produce, enableMapSet } from 'immer';
import { ConnectedServicesProviderEnum } from '@/client';

enableMapSet();

export type DocsProviderType = 'google-drive' | 'dropbox';

export interface ConversationContextProps {
  children: ReactNode;
}

export interface UserMessageDocument {
  id: string;
  title: string;
  url: string;
  label: string;
  provider: ConnectedServicesProviderEnum;
}

export interface UserMessageCustomization {
  context_size?: number;
  quoted_messages: Set<string>;
}

export interface ConversationCustomization extends UserMessageCustomization {
  incognito: boolean;
  docs: UserMessageDocument[];
}

export interface ConversationContext extends ConversationCustomization {
  updateCustomizations: Dispatch<Actions>;
}

const defaultContext: ConversationContext = {
  incognito: false,
  context_size: undefined,
  quoted_messages: new Set<string>(),
  docs: [],
  updateCustomizations: () => void 0,
};

export enum ActionType {
  SET_CONTEXT_SIZE = 'set.context_size',
  ADD_QUOTED_MESSAGE = 'add.context_message',
  REMOVE_QUOTED_MESSAGE = 'remove.context_message',
  TOGGLE_INCOGNITO = 'toggle.incognito',
  ADD_DOCUMENT = 'add.doc',
}

export interface SetContextSizeAction {
  type: ActionType.SET_CONTEXT_SIZE;
  payload: number;
}

export interface AddQuotedMessageAction {
  type: ActionType.ADD_QUOTED_MESSAGE;
  payload: string;
}

export interface RemoveQuotedMessageAction {
  type: ActionType.REMOVE_QUOTED_MESSAGE;
  payload: string;
}

export interface ToggleIncognitoAction {
  type: ActionType.TOGGLE_INCOGNITO;
  payload?: boolean;
}

export interface AddDocumentAction {
  type: ActionType.ADD_DOCUMENT;
  payload: UserMessageDocument;
}

export type Actions =
  | SetContextSizeAction
  | AddQuotedMessageAction
  | RemoveQuotedMessageAction
  | ToggleIncognitoAction
  | AddDocumentAction;

function reducer(state: ConversationCustomization, action: Actions) {
  switch (action.type) {
    case ActionType.SET_CONTEXT_SIZE: {
      const nextState = produce(state, (draft) => void (draft.context_size = action.payload));
      return nextState;
    }

    case ActionType.ADD_QUOTED_MESSAGE: {
      const nextState = produce(state, (draft) => {
        const quoted_messages = draft.quoted_messages;
        quoted_messages.add(action.payload);
      });
      return nextState;
    }

    case ActionType.REMOVE_QUOTED_MESSAGE: {
      const nextState = produce(state, (draft) => {
        const quoted_messages = draft.quoted_messages;
        quoted_messages.delete(action.payload);
      });
      return nextState;
    }

    case ActionType.TOGGLE_INCOGNITO: {
      const nextState = produce(state, (draft) => {
        draft.incognito = action.payload ?? !draft.incognito;
      });
      return nextState;
    }

    case ActionType.ADD_DOCUMENT: {
      const nextState = produce(state, (draft) => {
        const index = draft.docs.findIndex((doc) => doc.id === action.payload.id);
        if (index === -1) return void draft.docs.unshift(action.payload);
        draft.docs.splice(index, 1);
        draft.docs.unshift(action.payload);
      });
      return nextState;
    }

    default:
      return state;
  }
}

class ConversationContextActions {
  setContextSize(size: number): SetContextSizeAction {
    return { payload: size, type: ActionType.SET_CONTEXT_SIZE };
  }

  addQuotedMessage(message_id: string): AddQuotedMessageAction {
    return { payload: message_id, type: ActionType.ADD_QUOTED_MESSAGE };
  }

  removeQuotedMessage(message_id: string): RemoveQuotedMessageAction {
    return { payload: message_id, type: ActionType.REMOVE_QUOTED_MESSAGE };
  }

  toggleIncognito(on?: boolean): ToggleIncognitoAction {
    return { type: ActionType.TOGGLE_INCOGNITO, payload: on };
  }

  addDocument(data: UserMessageDocument): AddDocumentAction {
    return { payload: data, type: ActionType.ADD_DOCUMENT };
  }
}

export const actions = new ConversationContextActions();

export const ConversationContext = createContext<ConversationContext>(defaultContext);

export const ConversationContextProvider = (props: ConversationContextProps) => {
  const [state, dispacth] = useReducer(reducer, defaultContext);

  const context = useMemo(() => ({ ...state, updateCustomizations: dispacth }), [state]);

  return <ConversationContext.Provider value={context}>{props.children}</ConversationContext.Provider>;
};
