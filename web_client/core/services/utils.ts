import { AxiosResponse } from 'axios';

import { ResponseMetadata } from '@/client';
import { InfiniteData, QueryClient, QueryKey } from '@tanstack/react-query';
import { Draft, produce } from 'immer';

type ResponseData<T> = Record<'data', T[]>;
type ResponseDataMetadata<T> = AxiosResponse<Record<'metadata', T>>;
type InferResponseDataT<ResponseDataT> = ResponseDataT extends ResponseData<infer T> ? T : never;

type WriteInfo<R> = {
  queryKey: QueryKey;
  previous: InfiniteData<AxiosResponse<R>> | undefined;
  written: InfiniteData<AxiosResponse<R>> | undefined;
};

export function writeOptimisticInfiniteData<
  R extends ResponseData<InferResponseDataT<R>>,
  T extends InferResponseDataT<R> = InferResponseDataT<R>,
>(
  queryClient: QueryClient,
  partialQueryKey: QueryKey,
  incomingData: T,
  matcher: (draftData: Draft<InferResponseDataT<R>>) => boolean,
): WriteInfo<R> | undefined {
  const queryKey = queryClient.getQueryCache().find(partialQueryKey, { exact: false, type: 'active' })?.queryKey;

  if (!queryKey) return;

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

export const getPreviousPageParam = <T extends ResponseDataMetadata<ResponseMetadata>>(lastPage: T) => {
  return lastPage.data.metadata.page_info.has_prev ? lastPage.data.metadata.page_info.top_cursor : null;
};

export const getNextPageParam = <T extends ResponseDataMetadata<ResponseMetadata>>(lastPage: T) => {
  return lastPage.data.metadata.page_info.has_next ? lastPage.data.metadata.page_info.bottom_cursor : null;
};
