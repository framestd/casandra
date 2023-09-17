export enum StreamTypeEnum {
  SIGNAL = 'signal',
  DATA = 'data',
  STATUS = 'status',
  MESSAGE = 'message',
}

export enum SocketSignalEnum {
  BEGIN = 'begin',
  END = 'end',
}

export interface Stream {
  type: StreamTypeEnum;
  channel: string | null;
  message: string;
}

export interface MessageStream extends Stream {
  type: StreamTypeEnum.MESSAGE;
}

export interface SignalStream extends Stream {
  type: StreamTypeEnum.SIGNAL;
  signal: SocketSignalEnum;
}

export interface StatusStream extends Stream {
  type: StreamTypeEnum.STATUS;
  status: string;
}

export interface DataStream<DataT> extends Stream {
  type: StreamTypeEnum.DATA;
  data: DataT;
}

export type WebSocketStream<DataT = any> = MessageStream | SignalStream | StatusStream | DataStream<DataT>;
