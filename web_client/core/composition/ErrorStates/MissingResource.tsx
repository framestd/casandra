import { Fragment } from 'react';

import { Tag, TagLabel, VStack } from '@/chakra-ui/react';

import { ErrorCode } from '@/client';
import { NotFoundIllustration } from '@/core/components/Illustrations';
import { Typography } from '@/core/components/Typography';
import { isErrorResponse } from '@/core/services/utils';

import { ErrorStateProps } from './types';

export const MissingResourceState = (props: ErrorStateProps) => {
  const { error, reset, errorStates, nextStateCursor, ...rest } = props;

  const NextErrorState = errorStates.at(nextStateCursor);

  const isAppOrAppHTTPError = isErrorResponse(error);
  const isMissingResource = isAppOrAppHTTPError && error.code === ErrorCode.MISSING_RESOURCE;

  if (!isMissingResource)
    return NextErrorState ? (
      <NextErrorState
        error={error}
        reset={reset}
        errorStates={errorStates}
        nextStateCursor={nextStateCursor + 1}
        {...rest}
      />
    ) : (
      <Fragment />
    );

  return (
    <VStack {...rest}>
      <NotFoundIllustration />

      <Typography textStyle="h3" fontWeight="600">
        {error.title}
      </Typography>

      <Tag size="sm" colorScheme="red" borderRadius="full">
        <TagLabel>CODE: {error.code}</TagLabel>
      </Tag>

      <Typography textStyle="adaptive-sm-md-lg">{error.message}</Typography>
    </VStack>
  );
};
