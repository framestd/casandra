import { Token } from '@/client';

import {
  AppEventAbstract,
  ClientCustomEvent,
  ClientEventHandlerBase,
  ClientEventMapBase,
  ClientEventsType,
} from './event';

export interface SignOutEvent extends ClientCustomEvent<unknown> {}
export interface TokenRefreshEvent<T extends Token = Token> extends ClientCustomEvent<T> {}

export interface ClientEventHandler extends ClientEventHandlerBase {
  tokenrefresh: <T extends Token>(event: TokenRefreshEvent<T>) => void;
  signout: (event: SignOutEvent) => void;
}

export interface ClientEventMap extends ClientEventMapBase {
  tokenrefresh: TokenRefreshEvent;
  signout: SignOutEvent;
}

export class AppClientEvent extends AppEventAbstract<ClientEventMap, ClientEventHandler> {
  public readonly type = 'client';
  constructor() {
    super();
  }

  trigger<E extends ClientEventsType, D extends ClientEventMap[E]['detail']>(event: E, data?: D): boolean {
    return window.dispatchEvent(new CustomEvent(event, { detail: data }));
  }

  listen<E extends ClientEventsType>(event: E, handler: ClientEventHandler[E]): void {
    return window.addEventListener(event, handler);
  }

  unlisten<E extends ClientEventsType>(event: E, handler: ClientEventHandler[E]): void {
    return window.removeEventListener(event, handler);
  }
}

// export const appClientEvent = new AppClientEvent();
