'use client';

import { createContext, Dispatch, ReactNode, useMemo, useReducer } from 'react';

import { produce, enableMapSet } from 'immer';

enableMapSet();

export interface ConversationContextProps {
  children: ReactNode;
}

export interface UserMessageCusomization {
  context_size?: number;
  quoted_messages: Set<string>;
}

export interface ConversationCustomization extends UserMessageCusomization {
  incognito: boolean;
}

export interface ConversationContext extends ConversationCustomization {
  updateCustomizations: Dispatch<Actions>;
}

const defaultContext: ConversationContext = {
  incognito: false,
  context_size: undefined,
  quoted_messages: new Set<string>(),
  updateCustomizations: () => void 0,
};

export enum ActionType {
  SET_CONTEXT_SIZE = 'set_context_size',
  ADD_QUOTED_MESSAGE = 'add_context_message',
  REMOVE_QUOTED_MESSAGE = 'remove_context_message',
  TOGGLE_INCOGNITO = 'toggle_incognito',
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

export type Actions = SetContextSizeAction | AddQuotedMessageAction | RemoveQuotedMessageAction | ToggleIncognitoAction;

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

    default:
      return state;
  }
}

export const ConversationContext = createContext<ConversationContext>(defaultContext);

export const ConversationCustomizationProvider = (props: ConversationContextProps) => {
  const [state, dispacth] = useReducer(reducer, defaultContext);

  const context = useMemo(() => ({ ...state, updateCustomizations: dispacth }), [state]);

  return <ConversationContext.Provider value={context}>{props.children}</ConversationContext.Provider>;
};

export const setContextSize = (size: number): SetContextSizeAction => {
  return { payload: size, type: ActionType.SET_CONTEXT_SIZE };
};

export const addQuotedMessage = (message_id: string): AddQuotedMessageAction => {
  return { payload: message_id, type: ActionType.ADD_QUOTED_MESSAGE };
};

export const removeQuotedMessage = (message_id: string): RemoveQuotedMessageAction => {
  return { payload: message_id, type: ActionType.REMOVE_QUOTED_MESSAGE };
};

export const toggleIncognito = (on?: boolean): ToggleIncognitoAction => {
  return { type: ActionType.TOGGLE_INCOGNITO, payload: on };
};
