import { chatClient } from './client';
import { MessageCreateConcrete } from './dto';

import { api } from '../base';

export async function createMessageService(message: MessageCreateConcrete) {
  const postChatMessage = await chatClient.createMessageChatsMessagePost(message);

  const response = await postChatMessage(api);

  return response;
}
