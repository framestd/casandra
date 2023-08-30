import { cache } from 'react';
import { getApplicationInfo } from '../_app';

export const getApplicationInfo_Cached = cache(getApplicationInfo);
