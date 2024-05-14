import { useEffect, useRef, useState } from 'react';

import { readBinaryData } from '@/core/services/utils';
import { WebSocketManager, WebSocketManagerOptions, WebSocketManagerState, WSStatus } from '@/core/services/websocket';
import { isURL } from '@/core/utils';

export type WithURL<T> = T & { url: string | URL };
export type WithOptions<T, Options> = T & { options: Options };

export interface UseWebSocketManagerOptions extends WebSocketManagerOptions {
  connect?: boolean;
}

export interface UseWebSocketManagerBaseResult<MessageT, ErrorT = unknown, IsSuccess extends boolean = boolean> {
  message: IsSuccess extends true ? MessageT : MessageT | null;
  error: IsSuccess extends false ? ErrorT : ErrorT | null;
  isSuccess: IsSuccess;
  state: WebSocketManagerState;
}

type UseWebSocketManagerErrorResult<MessageT, ErrorT = unknown> = UseWebSocketManagerBaseResult<
  MessageT,
  ErrorT,
  false
>;

type UseWebSocketManagerSuccessResult<MessageT, ErrorT = unknown> = UseWebSocketManagerBaseResult<
  MessageT,
  ErrorT,
  true
>;

export type UseWebSocketManagerResult<MessageT, ErrorT = unknown> =
  | UseWebSocketManagerSuccessResult<MessageT, ErrorT>
  | UseWebSocketManagerErrorResult<MessageT, ErrorT>;

export class WebSocketError extends Error {
  constructor(public readonly reason: string, public readonly code: WSStatus) {
    super();
  }
}

export function resolveUrlOrOptions<OptionsT extends Omit<WithURL<Record<string, any>>, 'url'>>(
  urlOrOptions: string | URL | WithURL<OptionsT>,
  options: OptionsT,
): WithURL<unknown> & WithOptions<unknown, OptionsT> {
  let url: URL | string;

  if (isURL(urlOrOptions)) {
    url = urlOrOptions;
  } else {
    // @ts-expect-error
    ({ url, ...options } = urlOrOptions);
  }

  return { url, options };
}

export function useWebSocketManager<MessageT>(
  url: string,
  options?: UseWebSocketManagerOptions,
): UseWebSocketManagerResult<MessageT, WebSocketError>;

export function useWebSocketManager<MessageT>(
  url: URL,
  options?: UseWebSocketManagerOptions,
): UseWebSocketManagerResult<MessageT, WebSocketError>;

export function useWebSocketManager<MessageT>(
  options: WithURL<UseWebSocketManagerOptions>,
): UseWebSocketManagerResult<MessageT, WebSocketError>;

export function useWebSocketManager<MessageT>(
  urlOrOptions: string | URL | WithURL<UseWebSocketManagerOptions>,
  options: UseWebSocketManagerOptions = {},
): UseWebSocketManagerResult<MessageT, WebSocketError> {
  const ref = useRef(resolveUrlOrOptions(urlOrOptions, options));
  const successRef = useRef(false);

  const [message, setMessage] = useState<MessageT | null>(null);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [error, setError] = useState<WebSocketError | null>(null);
  const [state, setState] = useState<WebSocketManagerState>(WebSocketManagerState.CONNECTING);

  useEffect(() => {
    ref.current = resolveUrlOrOptions(urlOrOptions, options);
  }, [options, urlOrOptions]);

  useEffect(() => {
    const { connect, ...managerOptions } = ref.current.options;
    const manager = new WebSocketManager(ref.current.url.toString(), managerOptions);

    const updateSuccessState = (success: boolean) => setIsSuccess((successRef.current = success));

    manager.on('state', (s) => setState(s));
    manager.on('error', () => setIsSuccess((successRef.current = false)));
    manager.on('open', () => setError(null));
    manager.on('close', (ev) => successRef.current === false && setError(new WebSocketError(ev.reason, ev.code)));

    manager.on('message', (ev: MessageEvent<Blob | string>) => {
      if (typeof ev.data === 'string')
        Promise.resolve(ev.data)
          .then((data) => setMessage(JSON.parse(data)))
          .then(() => updateSuccessState(true));
      else
        readBinaryData(ev.data)
          .then((data) => setMessage(JSON.parse(data)))
          .then(() => updateSuccessState(true));
    });

    connect === true && manager.connect();

    const disconnectOnWindowUnload = () => manager.disconnect();

    window.addEventListener('beforeunload', disconnectOnWindowUnload);

    return () => {
      manager.disconnect();
      window.removeEventListener('beforeunload', disconnectOnWindowUnload);
    };
  }, []);

  if (!isSuccess) return { message, isSuccess, error: error!, state };

  return { message: message!, isSuccess, error, state };
}
