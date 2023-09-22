import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { Conversation, ConversationUpdate, StandardPaginatedResponseConversation } from '@/client';

import { BaseInfiniteQueryServiceOptions, WithId } from '../types';
import { getNextPageParam, getPreviousPageParam, writeOptimisticInfiniteData } from '../utils';
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
    queryFn: async ({ signal }) => await readConversationsService(variables, { signal }),
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

    async onMutate(variables) {
      const { id, ...update } = variables;
      const partialQueryKey = [ConversationKeysNS.READ_CONVERSATIONS];

      const writeInfo = await writeOptimisticInfiniteData<StandardPaginatedResponseConversation>(
        queryClient,
        partialQueryKey,
        { id, ...update } as Conversation,
        (draft) => draft.id === id,
      );

      if (!writeInfo) return;

      return { queryKey: writeInfo.queryKey, previous: writeInfo.previous };
    },

    onError(_err, _variables, context) {
      if (!context) return;
      queryClient.setQueryData(context.queryKey, context.previous);
    },

    onSettled(_data, _err, _var, context) {
      if (!context) return;

      queryClient.invalidateQueries({
        queryKey: context.queryKey,
        exact: true,
        type: 'active',
      });
    },
  });
}
