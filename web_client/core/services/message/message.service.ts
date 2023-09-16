import { ChatMessageRoleEnum } from '@/client';

import { api } from '../base';
import { BasePagedServiceParams } from '../types';
import { messageClient } from './client';

export interface ReadMessagesVariables extends BasePagedServiceParams {
  body?: string;
  role?: ChatMessageRoleEnum;
  responseFromId?: string;
  responseToId?: string;
}

export async function readMessageByIdService(id: string) {
  const readChatMessageById = await messageClient.readChatMessageByIdMessagesIdGet(id);

  const response = await readChatMessageById(api);

  return response;
}

export async function readMessagesByConversationIdService(conversation_id: string, varialbles: ReadMessagesVariables) {
  const readMessagesByConversationId = await messageClient.readChatMessagesByConversationIdMessagesGet(
    conversation_id,
    varialbles.sort?.join(','),
    varialbles.body,
    varialbles.role,
    varialbles.responseFromId,
    varialbles.responseToId,
    varialbles.pageCursor,
    varialbles.pageSize,
    varialbles.pageForward,
  );

  const response = await readMessagesByConversationId(api);

  return response;
}
