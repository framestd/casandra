'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { Accordion, AccordionButton, AccordionItem, AccordionPanel, Box, StackProps, VStack } from '@/chakra-ui/react';

import { Conversation } from '@/client';
import { Typography } from '@/core/components/Typography';
import { useGroupBy, usePagedNormalizer, useThemeConstants } from '@/core/composition/hooks';
import { useReadConversationsService, useReviseConversationService } from '@/core/services/conversation';
import { backdropFactory } from '@/core/theme';
import { range } from '@/core/utils';
import { timeAgo } from '@/core/utils/date';

import { ConversationBarToolbar } from './ConversationBarToolbar';
import { ConversationList, ConversationListProps, itemToId } from './ConversationList';

export interface ConversationBarProps extends StackProps {
  activeConversationId: string;
}

export const groupToId = (group: string) => `group-${group.replace(/\s+/g, '-')}`;

export const ConversationBar = ({ activeConversationId, ...rest }: ConversationBarProps) => {
  const frame = useRef(-1);
  const containerRef = useRef<HTMLDivElement>();
  const toolbarRef = useRef<HTMLDivElement>();

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

  useEffect(() => {
    frame.current = window.requestAnimationFrame(() => {
      const container = containerRef.current;
      const toolbar = toolbarRef.current;
      const entry = entries.find(([_, conversations]) => conversations.some((c) => c.id === activeConversationId));

      if (!entry) return;

      const [group] = entry;
      const activeGroup = document.querySelector<HTMLDivElement>(`[data-group=${groupToId(group)}]`);
      const activeItem = document.querySelector<HTMLAnchorElement>(`[data-item=${itemToId(activeConversationId)}]`);

      if (!activeGroup || !activeItem || !container || !toolbar) return;

      container.scrollTo({
        top: activeGroup.offsetTop + activeItem.offsetTop - toolbar.offsetHeight,
        behavior: 'instant',
      });
    });
    () => window.cancelAnimationFrame(frame.current);
  }, [activeConversationId, entries]);

  return (
    <VStack
      spacing={0}
      width="full"
      height="full"
      overflowY="auto"
      borderRadius="2xl"
      alignItems="flex-start"
      position="relative"
      ref={containerRef}
      {...rest}
    >
      <ConversationBarToolbar
        ref={toolbarRef}
        filter={subjectFilter}
        onFilterChange={(filter) => setSubjectFilter(filter)}
      />

      <Accordion
        width="full"
        display="flex"
        flexDirection="column"
        flex="1 1 auto"
        key={dataUpdatedAt}
        allowMultiple={true}
        defaultIndex={activeIndices}
      >
        {entries.map(([group, conversations]) => {
          return (
            <AccordionItem
              borderWidth={0}
              data-group={groupToId(group)}
              key={groupToId(group)}
              _first={{ borderWidth: 0 }}
              _last={{ borderWidth: 0 }}
            >
              <Typography as="h2" position="sticky" top={73} zIndex={1} {...backdropFactory({ bgColor: blended_bg })}>
                <AccordionButton px={4} py={1} fontSize="sm">
                  <Box opacity={0.6}>{group}</Box>
                </AccordionButton>
              </Typography>

              <AccordionPanel px={0} py={0} {...backdropFactory({ bgColor: blended_bg })}>
                <ConversationList
                  conversations={conversations}
                  activeConversationId={activeConversationId}
                  onReviseTopic={saveRevision}
                />
              </AccordionPanel>
            </AccordionItem>
          );
        })}
        {/* Don't touch it: It's a hack to fill up space with a background when other items are collapsed. */}
        {/* It's all just to make the backdrop (backdrop-filter: blur) work well as we can't have nested backdrops. */}
        {/* The Group heading, which is the AccordionItem collapse button, has it's own backdrop because it's sticky */}
        {/* and would require a quite opaque background when it sticks. AccordionPanel has it's own backdrop too, */}
        {/* because AcordionItem has no background and is transparent. So these child elements make up their parent */}
        {/* background and define a visual bounding rect for the AccordionItem */}
        <AccordionItem
          height="full"
          flex="1 1 auto"
          borderWidth={0}
          _first={{ borderWidth: 0 }}
          _last={{ borderWidth: 0 }}
          {...backdropFactory({ bgColor: blended_bg })}
        />
      </Accordion>
    </VStack>
  );
};
