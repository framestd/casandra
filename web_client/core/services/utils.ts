import { AxiosResponse } from 'axios';
import { Draft, produce } from 'immer';

import { InfiniteData, QueryClient, QueryKey } from '@tanstack/react-query';

import { ResponseMetadata } from '@/client';

type ResponseData<T> = Record<'data', T[]>;
type ResponseDataMetadata<T> = AxiosResponse<Record<'metadata', T>>;
type InferResponseDataT<ResponseDataT> = ResponseDataT extends ResponseData<infer T> ? T : never;

type WriteInfo<R> = {
  queryKey: QueryKey;
  previous: InfiniteData<AxiosResponse<R>> | undefined;
  written: InfiniteData<AxiosResponse<R>> | undefined;
};

export type PageParam = { pageCursor: string | null; pageForward: boolean };

export async function writeOptimisticInfiniteData<
  R extends ResponseData<InferResponseDataT<R>>,
  T extends InferResponseDataT<R> = InferResponseDataT<R>,
>(
  queryClient: QueryClient,
  partialQueryKey: QueryKey,
  incomingData: T,
  matcher: (draftData: Draft<InferResponseDataT<R>>) => boolean,
  initial: 'rpush' | 'lpush' = 'rpush',
): Promise<WriteInfo<R> | undefined> {
  const queryKey = queryClient.getQueryCache().find(partialQueryKey, { exact: false, type: 'active' })?.queryKey;

  if (!queryKey) return;

  await queryClient.cancelQueries({ queryKey, exact: false });

  const previous = queryClient.getQueryData<InfiniteData<AxiosResponse<R>>>(queryKey);

  const written = queryClient.setQueryData<InfiniteData<AxiosResponse<R>>>(queryKey, (queryData) => {
    if (!queryData) return;

    const newData = produce(queryData, (draft) => {
      let indexOfCurrentData = -1;

      const indexOfPage = draft.pages.findIndex((page) => {
        const pageFound = page.data.data.some((currentData, j) => {
          const currentDataFound = matcher(currentData);

          if (currentDataFound) indexOfCurrentData = j;

          return currentDataFound;
        });

        return pageFound;
      });

      if (indexOfPage === -1) {
        if (initial === 'lpush') {
          return void draft.pages.at(indexOfPage)!.data.data.unshift(incomingData as Draft<T>);
        }
        return void draft.pages.at(indexOfPage)!.data.data.push(incomingData as Draft<T>);
      }

      const page = draft.pages.at(indexOfPage)!;
      const currentData = page.data.data[indexOfCurrentData];

      page.data.data[indexOfCurrentData] = Object.assign({}, currentData, incomingData as Draft<T>);
    });

    return newData;
  });

  return { queryKey, previous, written };
}

export const base64UrlEncode = (data: string) => {
  if (typeof window === 'undefined' && typeof Buffer !== 'undefined') return Buffer.from(data).toString('base64url');
  return btoa(data).replace(/\+/g, '-').replace(/\//g, '_');
};

export const getPreviousPageParam = <T extends ResponseDataMetadata<ResponseMetadata>>(
  lastPage: T,
): PageParam | undefined => {
  const pageInfo = lastPage.data.metadata.page_info;
  const pageCursor = pageInfo.top_cursor!;
  return pageInfo.has_prev ? { pageCursor, pageForward: false } : undefined;
};

export const getNextPageParam = <T extends ResponseDataMetadata<ResponseMetadata>>(
  lastPage: T,
): PageParam | undefined => {
  const pageInfo = lastPage.data.metadata.page_info;
  const pageCursor = pageInfo.bottom_cursor!;
  return pageInfo.has_next ? { pageCursor, pageForward: true } : undefined;
};
