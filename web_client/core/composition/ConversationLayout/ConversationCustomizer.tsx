import { Box, VStack } from '@chakra-ui/layout';

import { backdropFactory } from '@/core/theme';

import { useThemeConstants } from '../hooks';

export interface ConversationCustomizerProps {}

export const ConversationCustomizer = () => {
  const { blended_bg } = useThemeConstants();

  return (
    <VStack width="full" height="full" borderRadius="2xl" {...backdropFactory({ bgColor: blended_bg })}>
      <Box></Box>
    </VStack>
  );
};
