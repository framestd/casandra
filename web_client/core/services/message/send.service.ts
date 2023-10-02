import { messageClient } from './client';
import { CustomizedMessageCreate } from './dto';

export async function publishMessageService(message: CustomizedMessageCreate) {
  const response = await messageClient.publishMessageMessagesPost({ bodyPublishMessageMessagesPost: message });

  return response;
}
