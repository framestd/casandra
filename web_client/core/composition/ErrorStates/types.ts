import { StackProps } from '@/chakra-ui/react';

import { FallbackProps } from 'react-error-boundary';

export interface ErrorStateProps extends StackProps {
  error: unknown;
  reset: FallbackProps['resetErrorBoundary'];
  errorStates: Array<(props: ErrorStateProps) => JSX.Element>;
  nextStateCursor: number;
}
