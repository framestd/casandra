import { Token } from '@/client/api';

import {
  AppEventAbstract,
  ServerCustomEvent,
  ServerEventHandlerBase,
  ServerEventMapBase,
  ServerEventsType,
} from './event';

export interface SignOutEvent extends ServerCustomEvent<unknown> {}
export interface TokenRefreshEvent<T extends Token = Token> extends ServerCustomEvent<T> {}

export interface ServerEventHandler extends ServerEventHandlerBase {
  tokenrefresh: <T extends Token>(event: TokenRefreshEvent<T>) => void;
  signout: (event: SignOutEvent) => void;
}

export interface ServerEventMap extends ServerEventMapBase {
  tokenrefresh: TokenRefreshEvent;
  signout: SignOutEvent;
}

export class AppServerEvent extends AppEventAbstract<ServerEventMap, ServerEventHandler> {
  public readonly type = 'server';
  constructor(private readonly emitter: import('node:events').EventEmitter) {
    super();
  }

  trigger<E extends ServerEventsType, D extends ServerEventMap[E]['detail']>(event: E, data?: D): boolean {
    return this.emitter.emit(event, { detail: data });
  }

  listen<E extends ServerEventsType>(event: E, handler: ServerEventHandler[E]): void {
    this.emitter.on(event, handler);
  }

  unlisten<E extends ServerEventsType>(event: E, handler: ServerEventHandler[E]): void {
    this.emitter.off(event, handler);
  }
}

// export const appServerEvent = new AppServerEvent();
