import { useEffect, useMemo } from 'react';

import Cookies from 'js-cookie';

import { createId as cuid2 } from '@paralleldrive/cuid2';
import { QueryFunctionContext, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { ChatMessageRoleEnum, Message, StandardPaginatedResponseMessage } from '@/client';
import { useWebSocket } from '@/core/composition/hooks';
import { ACCESS_TOKEN_KEY, getToken, uuidToHex, WS_ACCESS_TOKEN_KEY } from '@/core/utils';
import { CONVERSATIONS } from '@/core/utils/routes';

import { getSocketURL } from '../config';
import { BaseInfiniteQueryServiceOptions } from '../types';
import { PageParam, getNextPageParam, getPreviousPageParam, writeOptimisticInfiniteData } from '../utils';
import { isDataStream } from '../websocket';
import { readMessagesByConversationIdService, ReadMessagesVariables } from './message.service';
import { publishMessageService } from './send.service';

export interface ReadMessagesServiceOptions<S>
  extends BaseInfiniteQueryServiceOptions<StandardPaginatedResponseMessage, ReadMessagesVariables, S> {}

export enum MessageKeysNS {
  READ_MESSAGES = 'messages',
}

export function useReadMessagesByConversationIdService<S>(
  conversationId: string,
  options: ReadMessagesServiceOptions<S>,
) {
  const variables = options.variables;
  const queryKey = [MessageKeysNS.READ_MESSAGES, conversationId, variables];

  const result = useInfiniteQuery({
    enabled: options.trigger !== false,
    queryKey,
    queryFn: async ({ signal, pageParam }: QueryFunctionContext<typeof queryKey, PageParam>) => {
      const mergedVars = Object.assign(variables, pageParam);
      return await readMessagesByConversationIdService(conversationId, mergedVars, { signal });
    },
    select: options.select,
    getPreviousPageParam: getPreviousPageParam,
    getNextPageParam: getNextPageParam,
  });

  return result;
}

export function usePublishMessageService() {
  const queryClient = useQueryClient();

  return useMutation({
    meta: { report_error: true, title: 'Send Message' },
    mutationFn: publishMessageService,
    async onMutate(variables) {
      // <noop> message
      if (!variables.conversation_id) return;

      const partialQueryKey = [MessageKeysNS.READ_MESSAGES, variables.conversation_id];
      const partialMessage = { id: cuid2(), body: variables.body, role: ChatMessageRoleEnum.HUMAN } as Message;

      const writeInfo = await writeOptimisticInfiniteData<StandardPaginatedResponseMessage>(
        queryClient,
        partialQueryKey,
        partialMessage,
        (_) => false, // its a new message can never be matched
        'lpush',
      );

      if (!writeInfo) return;

      return { queryKey: writeInfo.queryKey, previous: writeInfo.previous };
    },

    onError(_err, _variables, context) {
      if (!context) return;
      queryClient.setQueryData(context.queryKey, context.previous);
    },

    /**
     * fix: publsihed message disappearing

     * newly published message (optimistically written to cache) disapears
     * from cache when query is invalidated on request settled
     * (onSettled, i.e., Promise.resolve or Promise.reject). This is so because
     * messages are not saved immediately when published, not until their
     * response stream is complete. This may change in the future
     */
    onSettled(_data, _err, _var, _context) {
      // DO NOT INVALIDATE: New message isn't available until the websocket stream ends
      //
      // if (!context) return;
      // queryClient.invalidateQueries({
      //   queryKey: context.queryKey,
      //   exact: true,
      //   type: 'active',
      // });
    },
  });
}

export function useConversationMessageSocket(id: string) {
  const queryClient = useQueryClient();
  const sockurl = useMemo(() => getSocketURL(`${CONVERSATIONS}/${id}/ws`), [id]);

  // Run on every render: the only reason this is in a useEffect hook is cause
  // it's uses browser only APIs, if not we can do without the hook.
  useEffect(() => {
    const wsCookie = Cookies.get(WS_ACCESS_TOKEN_KEY);
    const accessToken = getToken(ACCESS_TOKEN_KEY)!;
    if (wsCookie === undefined || wsCookie !== accessToken)
      Cookies.set(WS_ACCESS_TOKEN_KEY, accessToken, { path: '/conversations' });
  });

  const result = useWebSocket<Message>(sockurl, {
    connect: id !== 'new',
    onStreamEnd: async (s) => {
      const conversationId = uuidToHex(s.channel.split(':').at(-1)!);
      await queryClient.invalidateQueries({
        queryKey: [MessageKeysNS.READ_MESSAGES, conversationId],
        exact: false,
      });
    },
  });

  useEffect(() => {
    if (!result.isSuccess) return;

    const stream = result.message;
    const conversationId = uuidToHex(stream.channel.split(':').at(-1)!);
    const partialQueryKey = [MessageKeysNS.READ_MESSAGES, conversationId];

    isDataStream(stream) &&
      writeOptimisticInfiniteData<StandardPaginatedResponseMessage>(
        queryClient,
        partialQueryKey,
        stream.data,
        (draft) => draft.id === stream.data.id,
        'lpush',
      ).then(() => void 0);
  }, [queryClient, result.isSuccess, result.message]);

  return result;
}
