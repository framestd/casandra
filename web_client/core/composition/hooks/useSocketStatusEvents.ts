/* eslint-disable no-console */
import { useCallback } from 'react';

export function useSocketStatusEvents() {
  const onopen = useCallback((event: Event) => {
    console.log('Websocket connection established', event);
  }, []);

  const onclose = useCallback((event: CloseEvent) => {
    console.log('Websocket connection closed', event);
  }, []);

  const onerror = useCallback((event: Event) => {
    console.log('Websocket Error occured', event);
  }, []);

  return { onclose, onerror, onopen };
}
