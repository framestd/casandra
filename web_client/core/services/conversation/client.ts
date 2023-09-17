import { ConversationApiFp } from '@/client/api';

import { configuration } from '../config';

export const conversationClient = ConversationApiFp(configuration);
