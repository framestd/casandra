import { AxiosRequestConfig } from 'axios';

import { ChatMessageRoleEnum } from '@/client';

import { BasePagedServiceParams } from '../types';
import { messageClient } from './client';

export interface ReadMessagesVariables extends BasePagedServiceParams {
  body?: string;
  role?: ChatMessageRoleEnum;
  responseFromId?: string;
  responseToId?: string;
}

export async function readMessageByIdService(id: string, axiosOptions?: AxiosRequestConfig) {
  const response = await messageClient.readChatMessageByIdMessagesIdGet({ id }, axiosOptions);

  return response;
}

export async function readMessagesByConversationIdService(
  conversation_id: string,
  varialbles: ReadMessagesVariables,
  axiosOptions?: AxiosRequestConfig,
) {
  const response = await messageClient.readChatMessagesByConversationIdMessagesGet(
    {
      conversationId: conversation_id,
      body: varialbles.body,
      pageCursor: varialbles.pageCursor,
      pageForward: varialbles.pageForward,
      pageSize: varialbles.pageSize,
      responseFromId: varialbles.responseFromId,
      responseToId: varialbles.responseToId,
      role: varialbles.role,
      sort: varialbles.sort?.join(','),
    },
    axiosOptions,
  );

  return response;
}
