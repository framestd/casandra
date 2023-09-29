import { DataStream, StreamTypeEnum, SocketStream, SignalStream, StreamSignalEnum } from './types';

export const isDataStream = <T>(stream: SocketStream<T>): stream is DataStream<T> => {
  return stream.type === StreamTypeEnum.DATA;
};

export const isSignalStream = <T extends StreamSignalEnum = StreamSignalEnum>(
  stream: SocketStream<unknown>,
  signal: T | undefined = undefined,
): stream is SignalStream<T> => {
  if (signal !== undefined) {
    return stream.type === StreamTypeEnum.SIGNAL && stream.signal === signal;
  }
  return stream.type === StreamTypeEnum.SIGNAL;
};
