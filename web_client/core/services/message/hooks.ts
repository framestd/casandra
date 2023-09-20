import { useEffect, useMemo } from 'react';

import Cookies from 'js-cookie';

import { createId as cuid2 } from '@paralleldrive/cuid2';

import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { ChatMessageRoleEnum, Message, StandardPaginatedResponseMessage } from '@/client';
import { useWebSocket } from '@/core/composition/hooks';
import { ACCESS_TOKEN_KEY, getToken, uuidToHex, WS_ACCESS_TOKEN_KEY } from '@/core/utils';
import { CONVERSATIONS } from '@/core/utils/routes';

import { getSocketURL } from '../config';
import { BaseInfiniteQueryServiceOptions } from '../types';
import { getNextPageParam, getPreviousPageParam, writeOptimisticInfiniteData } from '../utils';
import { readMessagesByConversationIdService, ReadMessagesVariables } from './message.service';
import { publishMessageService } from './send.service';
import { isDataStream } from '../websocket';

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
    staleTime: Infinity,
    queryFn: async () => await readMessagesByConversationIdService(conversationId, variables),
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
    onMutate(variables) {
      // <noop> message
      if (!variables.conversation_id) return;

      const partialQueryKey = [MessageKeysNS.READ_MESSAGES, variables.conversation_id];
      const partialMessage = { id: cuid2(), body: variables.body, role: ChatMessageRoleEnum.HUMAN } as Message;

      const writeInfo = writeOptimisticInfiniteData<StandardPaginatedResponseMessage>(
        queryClient,
        partialQueryKey,
        partialMessage,
        (_) => false, // its a new message can never be matched
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

    reader.readAsText(event.data, 'utf-8');
  };

  useEffect(() => {
    // An active session is required before connecting to socket
    if (!config.has_active_session) return;

    const wsCookie = Cookies.get(WS_ACCESS_TOKEN_KEY);
    const accessToken = getToken(ACCESS_TOKEN_KEY)!;
    if (wsCookie === undefined || wsCookie !== accessToken)
      Cookies.set(WS_ACCESS_TOKEN_KEY, accessToken, { path: '/conversations' });

    const socket = new WebSocket(sockurl);

    socket.addEventListener('open', onopen);
    socket.addEventListener('message', onmessage);
    socket.addEventListener('close', onclose);
    socket.addEventListener('error', onerror);
    window.addEventListener('beforeunload', () => socket.close(1000, 'client:unload'));

    return () => socket.close(1000, 'client:done');
  }, [config.has_active_session, onclose, onerror, onopen, sockurl]);

  return message;
}
