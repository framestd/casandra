export enum WSStatus {
  WS_1000_NORMAL_CLOSURE = 1000,
  WS_1001_GOING_AWAY = 1001,
  WS_1002_PROTOCOL_ERROR = 1002,
  WS_1003_UNSUPPORTED_DATA = 1003,
  WS_1005_NO_STATUS_RCVD = 1005,
  WS_1006_ABNORMAL_CLOSURE = 1006,
  WS_1007_INVALID_FRAME_PAYLOAD_DATA = 1007,
  WS_1008_POLICY_VIOLATION = 1008,
  WS_1009_MESSAGE_TOO_BIG = 1009,
  WS_1010_MANDATORY_EXT = 1010,
  WS_1011_INTERNAL_ERROR = 1011,
  WS_1012_SERVICE_RESTART = 1012,
  WS_1013_TRY_AGAIN_LATER = 1013,
  WS_1014_BAD_GATEWAY = 1014,
  WS_1015_TLS_HANDSHAKE = 1015,
}

export enum StreamTypeEnum {
  SIGNAL = 'signal',
  DATA = 'data',
  STATUS = 'status',
  MESSAGE = 'message',
}

export enum StreamSignalEnum {
  BEGIN = 'begin',
  END = 'end',
}

export interface Stream {
  type: StreamTypeEnum;
  channel: string;
  message: string | null;
}

export interface MessageStream extends Stream {
  type: StreamTypeEnum.MESSAGE;
}

export interface SignalStream<SignalT extends StreamSignalEnum = StreamSignalEnum> extends Stream {
  type: StreamTypeEnum.SIGNAL;
  signal: SignalT;
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
