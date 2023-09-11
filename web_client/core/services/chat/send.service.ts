import { chatClient } from './client';
import { ChatMessageCreateConcrete } from './dto';

import { api } from '../base';

export async function createMessageService(message: ChatMessageCreateConcrete) {
  const postChatMessage = await chatClient.publishMessageChatsMessagePost(message);

  const response = await postChatMessage(api);

  return response;
}
