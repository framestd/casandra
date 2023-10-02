'use client';

import { useCallback, useMemo, useState } from 'react';

import { Accordion, AccordionButton, AccordionItem, AccordionPanel, Box, StackProps, VStack } from '@/chakra-ui/react';

import { Conversation } from '@/client';
import { useGroupBy, usePagedNormalizer, useThemeConstants } from '@/core/composition/hooks';
import { useReadConversationsService, useReviseConversationService } from '@/core/services/conversation';
import { timeAgo } from '@/core/utils/date';

import { ConversationBarToolbar } from './ConversationBarToolbar';
import { ConversationList, ConversationListProps } from './ConversationList';
import { backdropFactory } from '@/core/theme';
import { range } from '@/core/utils';

export interface ConversationBarProps extends StackProps {
  activeConversationId: string;
}

export const ConversationBar = ({ activeConversationId, ...rest }: ConversationBarProps) => {
  const { blended_bg } = useThemeConstants();
  const [subjectFilter, setSubjectFilter] = useState<string>();
  const { data, dataUpdatedAt } = useReadConversationsService({
    variables: { sort: ['last_active_at:desc'], subject: subjectFilter },
    select: (data) => {
      return {
        ...data,
        pages: data.pages.map((page) => page.data),
      };
    },
  });

  const conversations = usePagedNormalizer(data?.pages || []);
  const grouped = useGroupBy(
    conversations,
    useCallback((c: Conversation) => c.last_active_at, []),
    useCallback((v: string) => timeAgo(v), []),
  );

  const entries = useMemo(() => Array.from(grouped.entries()), [grouped]);
  const activeIndices = useMemo(() => Array.from(range(entries.length)), [entries.length]);

  const reviseConversationHandler = useReviseConversationService();

  const saveRevision = useCallback(
    (revision: Parameters<NonNullable<ConversationListProps['onReviseTopic']>>[0]) => {
      reviseConversationHandler.mutate({ id: revision.id, subject: revision.subject });
    },
    [reviseConversationHandler],
  );

  return (
    <VStack
      spacing={0}
      width="full"
      height="full"
      overflowY="auto"
      borderRadius="2xl"
      alignItems="flex-start"
      {...rest}
    >
      <ConversationBarToolbar filter={subjectFilter} onFilterChange={(filter) => setSubjectFilter(filter)} />

      <Accordion
        width="full"
        flex="1 1 auto"
        key={dataUpdatedAt}
        allowMultiple={true}
        defaultIndex={activeIndices}
        {...backdropFactory({ bgColor: blended_bg })}
      >
        {entries.map(([group, conversations]) => {
          return (
            <AccordionItem mt={4} key={group} borderWidth={0} _first={{ borderWidth: 0 }} _last={{ borderWidth: 0 }}>
              <h2>
                <AccordionButton px={4} py={0} mb={2} fontSize="sm">
                  <Box opacity={0.6}>{group}</Box>
                </AccordionButton>
              </h2>
              <AccordionPanel px={0} py={0}>
                <ConversationList
                  conversations={conversations}
                  activeConversationId={activeConversationId}
                  onReviseTopic={saveRevision}
                />
              </AccordionPanel>
            </AccordionItem>
          );
        })}
      </Accordion>
    </VStack>
  );
};
