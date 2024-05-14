import { Flex, FlexProps } from '@/chakra-ui/react';

import { FallbackProps } from 'react-error-boundary';

import { MissingResourceState } from './MissingResource';

export interface FallbackUIProps extends FlexProps {}
export interface FallbackUIBoundaryProps extends FallbackUIProps {
  boundary: FallbackProps;
}

export const useFallbackUI = (props: FallbackUIProps) => {
  const FallbackUIWrapper = (boundary: FallbackProps) => {
    return <FallbackUI boundary={boundary} {...props} />;
  };

  return FallbackUIWrapper;
};

export const FallbackUI = (props: FallbackUIBoundaryProps) => {
  const { boundary, ...rest } = props;
  const { error, resetErrorBoundary } = boundary;

  let nextStateCursor = 0;
  const errorStates = [MissingResourceState];
  const InitiatState = errorStates.at(nextStateCursor++)!;

  return (
    <Flex
      px={6}
      height="full"
      flex="1 1 auto"
      alignItems="center"
      borderTopRadius="2xl"
      justifyContent="center"
      {...rest}
    >
      <InitiatState
        error={error}
        reset={resetErrorBoundary}
        errorStates={errorStates}
        nextStateCursor={nextStateCursor}
      />
    </Flex>
  );
};
