import { AppClientEvent, ClientEventHandler, ClientEventMap } from './client';
import { AppEventAbstract, AppEventsType, ClientEventsType, ServerEventsType } from './event';
import { AppServerEvent, ServerEventHandler, ServerEventMap } from './server';

class AppEventAdapter extends AppEventAbstract<any, any> {
  constructor(private readonly event: AppClientEvent | AppServerEvent) {
    super();
  }

  trigger<E extends ClientEventsType, D extends ClientEventMap[E]['detail']>(event: E, data?: D): boolean;
  trigger<E extends ServerEventsType, D extends ServerEventMap[E]['detail']>(event: E, data?: D): boolean;
  trigger(event: any, data?: any): boolean {
    if (this.event.type === 'client') return this.event.trigger(event, data);
    return this.trigger(event, data);
  }

  listen<E extends ClientEventsType>(event: E, handler: ClientEventHandler[E]): void;
  listen<E extends ServerEventsType>(event: E, handler: ServerEventHandler[E]): void;
  listen<E extends AppEventsType>(event: E, handler: (...args: Array<any>) => void): void {
    this.event.listen(event, handler);
  }

  unlisten<E extends ClientEventsType>(event: E, handler: ClientEventHandler[E]): void;
  unlisten<E extends ServerEventsType>(event: E, handler: ServerEventHandler[E]): void;
  unlisten<E extends AppEventsType>(event: E, handler: (...args: Array<any>) => void): void {
    this.event.unlisten(event, handler);
  }
}

const EventEmitter = typeof window === 'undefined' ? (await import('node:events')).EventEmitter : undefined;

export const appEventAdapter = new AppEventAdapter(
  typeof EventEmitter === 'undefined' ? new AppClientEvent() : new AppServerEvent(new EventEmitter()),
);
