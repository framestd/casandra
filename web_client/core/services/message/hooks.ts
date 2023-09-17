import { useContext, useEffect, useMemo, useState } from 'react';

import Cookies from 'js-cookie';

import { useInfiniteQuery, useMutation } from '@tanstack/react-query';

import { Message, StandardPaginatedResponseMessage } from '@/client';
import { ConfigContext } from '@/core/components/Providers';
import { useSocketStatusEvents } from '@/core/composition/hooks';
import { ACCESS_TOKEN_KEY, getToken, WS_ACCESS_TOKEN_KEY } from '@/core/utils';
import { CONVERSATIONS } from '@/core/utils/routes';

import { getServerBaseURL } from '../config';
import { BaseInfiniteQueryServiceOptions } from '../types';
import { getNextPageParam, getPreviousPageParam } from '../utils';
import { StreamTypeEnum, WebSocketStream } from '../websocket';
import { readMessagesByConversationIdService, ReadMessagesVariables } from './message.service';
import { publishMessageService } from './send.service';

export interface SocketOptions {
  url?: URL;
  onMessageEnd?: () => void;
}

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
  return useMutation({ mutationFn: publishMessageService, meta: { report_error: true, title: 'Publish Message' } });
}

export function useConversationMessageSocket(conversationId: string, options: SocketOptions = {}) {
  const [message, setMessage] = useState<Message | null>(null);
  const { onclose, onerror, onopen } = useSocketStatusEvents();
  const { config } = useContext(ConfigContext);

  const sockurl = useMemo(() => {
    if (options.url) return options.url.toString();

    const url = new URL(getServerBaseURL() + `${CONVERSATIONS}/${conversationId}/ws`);

    url.protocol = 'ws:';

    return url.toString();
  }, [conversationId, options.url]);

  const onmessage = (event: MessageEvent<Blob>) => {
    const reader = new FileReader();

    reader.addEventListener('load', () => {
      const stream: WebSocketStream<Message> = JSON.parse(reader.result as string);

      if (stream.type === StreamTypeEnum.DATA) setMessage(stream.data);
    });

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
