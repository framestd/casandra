import { AxiosRequestConfig } from 'axios';

import { ConversationUpdate } from '@/client';

import { BasePagedServiceParams } from '../types';
import { conversationClient } from './client';

export interface ReadConversationsVariables extends BasePagedServiceParams {
  subject?: string;
}

export async function readConversationByIdService(id: string, axiosOptions?: AxiosRequestConfig) {
  const response = await conversationClient.readConversationByIdConversationsIdGet({ id }, axiosOptions);

  return response;
}

export async function readConversationsService(
  variables: ReadConversationsVariables,
  axiosOptions?: AxiosRequestConfig,
) {
  const response = await conversationClient.readConversationsConversationsGet(
    {
      subject: variables.subject,
      pageCursor: variables.pageCursor,
      pageForward: variables.pageForward,
      pageSize: variables.pageSize,
      sort: variables.sort?.join(','),
    },

    axiosOptions,
  );

  return response;
}

export async function reviseConversationService(id: string, update: ConversationUpdate) {
  const response = await conversationClient.reviseConversationConversationsIdPut({
    id,
    conversationUpdate: update,
  });

  return response;
}
