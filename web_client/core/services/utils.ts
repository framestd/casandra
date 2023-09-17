import { AxiosResponse } from 'axios';

import { ResponseMetadata } from '@/client';

export const base64UrlEncode = (data: string) => {
  return btoa(data).replace(/\+/g, '-').replace(/\//g, '_');
};

export const getPreviousPageParam = <T extends AxiosResponse<Record<'metadata', ResponseMetadata>>>(lastPage: T) => {
  return lastPage.data.metadata.page_info.has_prev ? lastPage.data.metadata.page_info.top_cursor : null;
};

export const getNextPageParam = <T extends AxiosResponse<Record<'metadata', ResponseMetadata>>>(lastPage: T) => {
  return lastPage.data.metadata.page_info.has_next ? lastPage.data.metadata.page_info.bottom_cursor : null;
};
