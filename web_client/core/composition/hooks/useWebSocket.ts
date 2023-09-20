import { useEffect } from 'react';

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
  const { url, options: opts } = resolveUrlOrOptions(urlOrOptions, options);

  const { onStreamBegin, onStreamEnd, ...managerOptions } = opts;
  const result = useWebSocketManager<WebSocketStream<MessageT>>(url.toString(), managerOptions);

  useEffect(() => {
    if (!result.isSuccess) return;

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
  }, [onStreamBegin, onStreamEnd, result.isSuccess, result.message]);

  return result;
}
