import { ChatApiFp } from '@/client/api';

import { configuration } from '../config';

export const chatClient = ChatApiFp(configuration);
