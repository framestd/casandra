import { useEffect, useRef } from 'react';

import { SignalStream, StreamSignalEnum, StreamTypeEnum, WebSocketStream } from '@/core/services/websocket';
import { never } from '@/core/utils';

import {
  resolveUrlOrOptions,
  useWebSocketManager,
  UseWebSocketManagerOptions,
  UseWebSocketManagerResult,
  WebSocketError,
  WithURL,
} from './useWebSocketManager';

export interface UseWebSocketOptions extends UseWebSocketManagerOptions {
  onStreamBegin?: (stream: SignalStream<StreamSignalEnum.BEGIN>) => void;
  onStreamEnd?: (stream: SignalStream<StreamSignalEnum.END>) => void;
}

export function useWebSocket<MessageT>(
  url: string,
  options?: UseWebSocketOptions,
): UseWebSocketManagerResult<WebSocketStream<MessageT>, WebSocketError>;

export function useWebSocket<MessageT>(
  url: URL,
  options?: UseWebSocketOptions,
): UseWebSocketManagerResult<WebSocketStream<MessageT>, WebSocketError>;

export function useWebSocket<MessageT>(
  options: WithURL<UseWebSocketOptions>,
): UseWebSocketManagerResult<WebSocketStream<MessageT>, WebSocketError>;

export function useWebSocket<MessageT>(
  urlOrOptions: string | URL | WithURL<UseWebSocketOptions>,
  options: UseWebSocketOptions = {},
): UseWebSocketManagerResult<WebSocketStream<MessageT>, WebSocketError> {
  const ref = useRef(resolveUrlOrOptions(urlOrOptions, options));

  useEffect(() => {
    ref.current = resolveUrlOrOptions(urlOrOptions, options);
  }, [options, urlOrOptions]);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { onStreamBegin: _onStreamBegin, onStreamEnd: _onStreamEnd, ...managerOptions } = ref.current.options;
  const result = useWebSocketManager<WebSocketStream<MessageT>>(ref.current.url.toString(), managerOptions);

  useEffect(() => {
    if (!result.isSuccess) return;

    const { onStreamBegin, onStreamEnd } = ref.current.options;
    const stream = result.message;

    if (stream.type === StreamTypeEnum.SIGNAL) {
      switch (stream.signal) {
        case StreamSignalEnum.BEGIN:
          onStreamBegin?.(stream as SignalStream<StreamSignalEnum.BEGIN>);
          break;
        case StreamSignalEnum.END:
          onStreamEnd?.(stream as SignalStream<StreamSignalEnum.END>);
          break;
        default:
          never(stream.signal);
      }
    }
  }, [result.isSuccess, result.message]);

  return result;
}
