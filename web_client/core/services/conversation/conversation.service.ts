import { ConversationUpdate } from '@/client';

import { api } from '../base';
import { BasePagedServiceParams } from '../types';
import { conversationClient } from './client';

export interface ReadConversationsVariables extends BasePagedServiceParams {
  subject?: string;
}

export async function readConversationsService(variables: ReadConversationsVariables) {
  const readConversations = await conversationClient.readConversationsConversationsGet(
    variables.sort?.join(','),
    variables.subject,
    variables.pageCursor,
    variables.pageSize,
    variables.pageForward,
  );

  const response = await readConversations(api);

  return response;
}

export async function reviseConversationService(id: string, update: ConversationUpdate) {
  const reviseConversation = await conversationClient.reviseConversationConversationsIdPut(id, update);

  const response = await reviseConversation(api);

  return response;
}
