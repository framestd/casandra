import { messageClient } from './client';
import { ChatMessageCreateConcrete } from './dto';

export async function publishMessageService(message: ChatMessageCreateConcrete) {
  const response = await messageClient.publishMessageMessagesPost({ messageCreate: message });

  return response;
}
