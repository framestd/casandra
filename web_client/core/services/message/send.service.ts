import { api } from '../base';
import { messageClient } from './client';
import { ChatMessageCreateConcrete } from './dto';

export async function publishMessageService(message: ChatMessageCreateConcrete) {
  const postChatMessage = await messageClient.publishMessageMessagesPost(message);

  const response = await postChatMessage(api);

  return response;
}
