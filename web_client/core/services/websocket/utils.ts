import { DataStream, StreamTypeEnum, SocketStream, SignalStream, StreamSignalEnum, ErrorStream } from './types';

export const isDataStream = <T>(stream: SocketStream<T>): stream is DataStream<T> => {
  return stream.type === StreamTypeEnum.DATA;
};

export const isErrorStream = <E>(stream: SocketStream<unknown, E>): stream is ErrorStream<E> => {
  return stream.type === StreamTypeEnum.ERROR;
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
