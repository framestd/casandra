import { useMutation } from '@tanstack/react-query';
import { createMessageService } from './send.service';

export function useSendMessage() {
  return useMutation({
    mutationFn: createMessageService,
    meta: {
      report_error: true,
      title: 'Send Message',
    },
  });
}
