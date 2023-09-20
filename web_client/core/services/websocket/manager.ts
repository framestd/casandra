import { isFunction } from '@/core/utils';

type WebSocketEventHandler<E extends keyof WebSocketManagerEventMap> = (ev: WebSocketManagerEventMap[E]) => any;

type WebSocketEventHandlerMap = { [P in keyof WebSocketManagerEventMap]: WebSocketEventHandler<P>[] };

type ResultantConfig = { [P in keyof WebSocketManagerConfig]: ReturnType<WebSocketManagerConfig[P]> };

interface WebSocketManagerConfig {
  /**
   * Computes the elligibility for a reconnection when the current connection closes
   * @param retryCount The amount of current retries
   * @param custom The custom value provided when WebSocketManager was instantiated
   * @returns A boolean indicating whether to reconnect or not
   */
  reconnect: (retryCount: number, custom: WebSocketManagerOptions['reconnect']) => boolean;
  /**
   * Computes a reconnection delay in milliseconds for the current phase of reconnection
   * @param retryCount The amount of current retries
   * @param custom The custom value provided when WebSocketManager was instantiated
   * @returns A delay in milliseconds that must pass before the next reconnection attempt
   */
  reconnectDelay: (retryCount: number, custom: WebSocketManagerOptions['reconnectDelay']) => number;
}

export interface WebSocketManagerEventMap extends WebSocketEventMap {
  state: WebSocketManagerState;
}

export interface WebSocketManagerOptions {
  reconnect?: boolean | ((retryCount: number) => boolean);
  reconnectDelay?: number | ((retryCount: number) => number);
}

export enum WebSocketManagerState {
  ERROR = 'error',
  CLOSED = 'closed',
  CONNECTED = 'connected',
  DISCONNECTED = 'disconnected',
  CONNECTING = 'connecting',
  RECONNECTING = 'reconnecting',
}

export class WebSocketManager {
  private websocket: WebSocket;
  private eventsMap: WebSocketEventHandlerMap;
  private onclose: WebSocketEventHandler<'close'>;
  private onerror: WebSocketEventHandler<'error'>;
  private onmessage: WebSocketEventHandler<'message'>;
  private onopen: WebSocketEventHandler<'open'>;
  private onStateChange: WebSocketEventHandler<'state'>;
  private reconnectionCount: number = 0;
  private timeoutId: NodeJS.Timeout | number = -1;
  private INTERNAL_STATE: WebSocketManagerState = WebSocketManagerState.DISCONNECTED;

  // With the following reconnect strategy, the reconnection
  // logic is tried 7 times in a total of a 180-second window.
  // Exponential Retry: ∑(i=1, n=7) 2 ^ i * 708.66142 ≃ 180 secs

  static get MAX_RETRY() {
    return 7 as const;
  }

  static get BASE_RETRY_INTERVAL() {
    return 708.66142 as const;
  }

  private static config: WebSocketManagerConfig = {
    /**
     * Computes the elligibility for a reconnection when the current connection closes
     * @param retryCount The amount of current retries
     * @param custom The custom value provided when WebSocketManager was instantiated
     * @returns A boolean indicating whether to reconnect or not
     */
    reconnect(retryCount, custom) {
      if (custom) return isFunction(custom) ? custom(retryCount) : custom;
      return retryCount < WebSocketManager.MAX_RETRY;
    },
    /**
     * Computes a reconnection delay in milliseconds for the current phase of reconnection
     * @param retryCount The amount of current retries
     * @param custom The custom value provided when WebSocketManager was instantiated
     * @returns A delay in milliseconds that must pass before the next reconnection attempt
     */
    reconnectDelay(retryCount, custom) {
      if (custom) return isFunction(custom) ? custom(retryCount) : custom;
      return WebSocketManager.BASE_RETRY_INTERVAL * Math.pow(2, retryCount + 1);
    },
  };

  constructor(url: string, options?: WebSocketManagerOptions);
  constructor(url: URL, options?: WebSocketManagerOptions);
  constructor(public readonly url: string | URL, private readonly options: WebSocketManagerOptions = {}) {
    this.resetEventsMap();

    this.onclose = (ev) => {
      this.STATE = WebSocketManagerState.CLOSED;
      this.eventsMap.close.forEach((fn) => fn.call(this.websocket, ev));

      // give time for the closed state to be propagated through event handler
      // by queueing a reconnection task following a state change task
      queueMicrotask(() => this.reconnect());
    };

    this.onerror = (ev) => {
      this.STATE = WebSocketManagerState.ERROR;
      this.eventsMap.error.forEach((fn) => fn.call(this.websocket, ev));
    };

    this.onmessage = (ev) => {
      this.eventsMap.message.forEach((fn) => fn.call(this.websocket, ev));

      // Reset reconnection count after a message comes in.
      // A message coming in guarantees the stability of the connection, so next time
      // a disconnection occurs the reconnect strategy can start on a clean slate.
      // If this was to be reset on connection open, then it could try to reconnect
      // infinitely if after the connection opened it closes which would be the case
      // for an unstable connection.
      this.resetReconnectionCount();
    };

    this.onopen = (ev) => {
      this.STATE = WebSocketManagerState.CONNECTED;
      this.eventsMap.open.forEach((fn) => fn.call(this.websocket, ev));
    };

    this.onStateChange = (ev) => {
      this.eventsMap.state.forEach((fn) => fn.call(this.websocket, ev));
    };
  }

  private set STATE(state: WebSocketManagerState) {
    queueMicrotask(() => {
      this.INTERNAL_STATE = state;
      this.onStateChange(state);
    });
  }

  private get STATE() {
    return this.INTERNAL_STATE;
  }

  private WebSocketManagerConfigFactory(options?: WebSocketManagerOptions): ResultantConfig {
    const reconnectionCount = this.reconnectionCount;
    return {
      reconnect: WebSocketManager.config.reconnect(reconnectionCount, options?.reconnect),
      reconnectDelay: WebSocketManager.config.reconnectDelay(reconnectionCount, options?.reconnectDelay),
    };
  }

  private reconnect(): void {
    const config = this.WebSocketManagerConfigFactory(this.options);

    if (config.reconnect === false) return;

    this.STATE = WebSocketManagerState.RECONNECTING;

    this.timeoutId = setTimeout(() => {
      this.reconnectionCount++;
      this.connect();
    }, config.reconnectDelay);
  }

  private resetEventsMap(): void {
    this.eventsMap = { close: [], error: [], message: [], open: [], state: [] };
  }

  private resetReconnectionCount(): void {
    this.reconnectionCount = 0;
  }

  connect(protocols?: string): void;
  connect(protocols?: string[]): void;
  connect(protocols?: string | string[]): void {
    // eslint-disable-next-line no-console
    console.info('Connecting websocket by manager');

    // only set state to connecting on initial connection
    if (this.reconnectionCount === 0) {
      this.STATE = WebSocketManagerState.CONNECTING;
    }

    this.websocket = new WebSocket(this.url, protocols);
    this.websocket.addEventListener('close', this.onclose);
    this.websocket.addEventListener('error', this.onerror);
    this.websocket.addEventListener('message', this.onmessage);
    this.websocket.addEventListener('open', this.onopen);
  }

  disconnect(): void {
    if (this.STATE === WebSocketManagerState.DISCONNECTED) return;
    // eslint-disable-next-line no-console
    console.info('Disconnecting websocket by manager');
    this.websocket.removeEventListener('close', this.onclose);
    this.websocket.removeEventListener('error', this.onerror);
    this.websocket.removeEventListener('message', this.onmessage);
    this.websocket.removeEventListener('open', this.onopen);
    this.websocket.close(1000);

    clearTimeout(this.timeoutId);

    this.STATE = WebSocketManagerState.DISCONNECTED;
    this.resetEventsMap();
  }

  on<E extends keyof WebSocketManagerEventMap>(event: E, handler: WebSocketEventHandler<E>): void {
    this.eventsMap[event].push(handler);
  }

  off<E extends keyof WebSocketManagerEventMap>(event: E, handler: WebSocketEventHandler<E>): void {
    const indexOfHandler = this.eventsMap[event].findIndex((v) => v === handler);
    this.eventsMap[event].splice(indexOfHandler, 1);
  }
}
