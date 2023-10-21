import { AccountApiFactory } from '@/client/api';
import { SERVER_BASE_PATH } from '@/core/utils';

import { api } from '../base';
import { configuration } from '../config';

export const accountClient = AccountApiFactory(configuration, SERVER_BASE_PATH, api);
