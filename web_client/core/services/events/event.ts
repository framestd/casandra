export type ClientEventsType = 'signout' | 'tokenrefresh';
export type ServerEventsType = 'signout' | 'tokenrefresh';
export type AppEventsType = ClientEventsType | ServerEventsType;

export type ClientEventMapBase = { [P in ClientEventsType]: ClientCustomEvent<any> };
export type ClientEventHandlerBase = {
  [P in ClientEventsType]: (event: ClientCustomEvent<any>) => void;
};

export type ServerEventMapBase = { [P in ServerEventsType]: ServerCustomEvent<any> };
export type ServerEventHandlerBase = {
  [P in ServerEventsType]: (event: ServerCustomEvent<any>) => void;
};

export interface AppCustomEvent<D = unknown> {
  detail?: D;
}

export interface ClientCustomEvent<D = unknown> extends AppCustomEvent<D>, Event {}

export interface ServerCustomEvent<D = unknown> extends AppCustomEvent<D> {}

export abstract class AppEventAbstract<
  EventMap extends ClientEventMapBase | ServerEventMapBase,
  EventHandler extends ClientEventHandlerBase | ServerEventHandlerBase,
> {
  public readonly type: 'client' | 'server';
  trigger<E extends AppEventsType, D extends EventMap[E]['detail']>(_event: E, _data?: D) {
    return false;
  }
  listen<E extends AppEventsType>(_event: E, _handler: EventHandler[E]) {}
  unlisten<E extends AppEventsType>(_event: E, _handler: EventHandler[E]) {}
}
