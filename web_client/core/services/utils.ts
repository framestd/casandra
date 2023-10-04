import { AxiosHeaders, AxiosResponse, HttpStatusCode } from 'axios';
import { getReasonPhrase } from 'http-status-codes';
import { Draft, produce } from 'immer';

import { InfiniteData, QueryClient, QueryFilters, QueryKey } from '@tanstack/react-query';

import { ResponseMetadata } from '@/client';

type ResponseData<T> = Record<'data', T[]>;
type ResponseDataMetadata<T> = AxiosResponse<Record<'metadata', T>>;
type InferResponseDataT<ResponseDataT> = ResponseDataT extends ResponseData<infer T> ? T : never;

type WriteInfo<R> = {
  queryKey: QueryKey;
  previous: AxiosResponse<R> | undefined;
  written: AxiosResponse<R> | undefined;
};

type InfiniteWriteInfo<R> = {
  queryKey: QueryKey;
  previous: InfiniteData<AxiosResponse<R>> | undefined;
  written: InfiniteData<AxiosResponse<R>> | undefined;
};

type WriteMockedAxiosResponseResult<T, IsInfinite> = IsInfinite extends true ? InfiniteWriteInfo<T> : WriteInfo<T>;

export type PageParam = { pageCursor: string | null; pageForward: boolean };

export async function writeMockedAxiosResponse<T, IsInfinite extends boolean = true>(
  queryClient: QueryClient,
  partialQueryKey: QueryKey,
  response: AxiosResponse<T>,
  predicate: QueryFilters['predicate'],
  isInfinite: IsInfinite = true as IsInfinite,
): Promise<WriteMockedAxiosResponseResult<T, IsInfinite> | undefined> {
  const queryKey = queryClient.getQueryCache().find(partialQueryKey, { exact: false, predicate })?.queryKey;

  if (!queryKey) return;

  if (isInfinite === true) {
    const written = queryClient.setQueryData<InfiniteData<typeof response>>(queryKey, () => {
      return { pages: [response], pageParams: [] };
    });

    return { written, previous: undefined, queryKey } as WriteMockedAxiosResponseResult<T, IsInfinite>;
  }

  const written = queryClient.setQueryData<typeof response>(queryKey, () => {
    return response;
  });

  return { written, previous: undefined, queryKey } as WriteMockedAxiosResponseResult<T, IsInfinite>;
}

/**
 * Write a react query infinite data to the cache optimisitically before even fetching over network
 *
 * `initial = 'lpush'` specifies that the data to be written should be pushed to the start of the list
 * when predicate cannot match an existing data to update with it.
 *
 * `initial = 'rpush'` specifies that the data to be written should be pushed to the end of the list when
 * predicate cannot match an existing data to update with it.
 *
 * @param queryClient The react query query client retrieved from useQueryCleint
 * @param partialQueryKey The partial (or full) query key
 * @param incomingData The incoming data to write to the query cache optimistically
 * @param predicate The predicate to use to match the exact data to write
 * @param initial Sepcify whether to push the data to the beginning or end of the list if predicate returns false
 * @returns Promise that resolves to a `WriteInfo<R>` object containing the written, overwritten data and query key
 */
export async function writeOptimisticInfiniteData<
  R extends ResponseData<InferResponseDataT<R>>,
  T extends InferResponseDataT<R> = InferResponseDataT<R>,
>(
  queryClient: QueryClient,
  partialQueryKey: QueryKey,
  incomingData: T,
  predicate: (draftData: Draft<InferResponseDataT<R>>) => boolean,
  initial: 'rpush' | 'lpush' = 'rpush',
): Promise<InfiniteWriteInfo<R> | undefined> {
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
          const currentDataFound = predicate(currentData);

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

export function readBinaryData(data: Blob): Promise<string> {
  const reader = new FileReader();
  return new Promise<string>((resolve, reject) => {
    reader.addEventListener('load', () => resolve(reader.result as string));
    reader.addEventListener('error', () => reject(reader.error));
    reader.readAsText(data, 'utf-8');
  });
}

export function mockAxiosResponse<DataT>(
  data: DataT,
  status: HttpStatusCode = HttpStatusCode.Ok,
): AxiosResponse<DataT> {
  return {
    config: { headers: new AxiosHeaders() },
    data: data,
    headers: {},
    status: status,
    statusText: getReasonPhrase(status),
    request: {},
  };
}
