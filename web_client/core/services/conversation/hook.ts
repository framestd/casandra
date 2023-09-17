import { AxiosResponse } from 'axios';
import { produce } from 'immer';

import { InfiniteData, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { ConversationUpdate, StandardPaginatedResponseConversation } from '@/client';

import { BaseInfiniteQueryServiceOptions, WithId } from '../types';
import { getNextPageParam, getPreviousPageParam } from '../utils';
import {
  readConversationsService,
  ReadConversationsVariables,
  reviseConversationService,
} from './conversation.service';

export enum ConversationKeysNS {
  READ_CONVERSATIONS = 'conversations',
}

export interface ReadConversationsServiceOptions<S>
  extends BaseInfiniteQueryServiceOptions<StandardPaginatedResponseConversation, ReadConversationsVariables, S> {}

export function useReadConversationsService<S>(options: ReadConversationsServiceOptions<S>) {
  const variables = options.variables;

  return useInfiniteQuery({
    enabled: options.trigger !== false,
    queryKey: [ConversationKeysNS.READ_CONVERSATIONS, variables],
    staleTime: Infinity,
    queryFn: async () => await readConversationsService(variables),
    select: options.select,
    getPreviousPageParam: getPreviousPageParam,
    getNextPageParam: getNextPageParam,
  });
}

export function useReviseConversationService() {
  const queryClient = useQueryClient();

  return useMutation({
    meta: { report_error: true, title: 'Update Conversation' },
    mutationFn: async (variables: WithId<ConversationUpdate>) => {
      const { id, ...update } = variables;
      const response = await reviseConversationService(id, update);

      return response;
    },

    onMutate(variables) {
      type QueryData = InfiniteData<AxiosResponse<StandardPaginatedResponseConversation>>;

      const { id, ...update } = variables;
      const queryKeyNamespace = ConversationKeysNS.READ_CONVERSATIONS;
      const queriesData = queryClient.getQueriesData<QueryData>([queryKeyNamespace]);
      const queryData = queryClient.getQueryData<QueryData>([queryKeyNamespace], { exact: false, type: 'active' });

      const queryKeyDataPair = queriesData.find(([_, data]) => data === queryData);

      const [queryKey] = queryKeyDataPair || [];

      if (!queryKey) return;

      queryClient.setQueryData<QueryData>(queryKey, (data) => {
        if (!data) return;

        const newData = produce(data, (draft) => {
          let indexOfConversation = -1;

          const indexOfPage = draft.pages.findIndex((page) => {
            const pageFound = page.data.data.some((data, j) => {
              const conversationFound = data.id === id;

              if (conversationFound) indexOfConversation = j;

              return conversationFound;
            });

            return pageFound;
          });

          if (indexOfPage === -1) return draft;

          const page = draft.pages.at(indexOfPage)!;

          const conversation = page.data.data[indexOfConversation];

          page.data.data[indexOfConversation] = Object.assign({}, conversation, update);
        });

        return newData;
      });

      return { queryKey, previous: queryData };
    },

    onError(_err, _variables, context) {
      if (!context) return;
      queryClient.setQueryData(context.queryKey, context.previous);
    },

    onSettled() {
      queryClient.invalidateQueries({
        queryKey: [ConversationKeysNS.READ_CONVERSATIONS],
        exact: false,
        type: 'active',
      });
    },
  });
}
