import { DataStream, StreamTypeEnum, WebSocketStream } from './types';

export const isDataStream = <T>(stream: WebSocketStream<T>): stream is DataStream<T> => {
  return stream.type === StreamTypeEnum.DATA;
};
