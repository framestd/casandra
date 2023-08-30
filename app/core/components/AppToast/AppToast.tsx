import { ReactNode } from 'react';

import { BasicToast } from './BasicToast';
import { ComplexToast } from './ComplexToast';

export type AppToastType = 'info' | 'success' | 'error' | 'default' | 'warn';

export interface AppToastProps {
  type?: AppToastType;
  title?: ReactNode;
  message?: ReactNode;
  icon?: ReactNode;
  variant?: 'basic' | 'complex';
  closeToast?: () => void;
}

export const AppToast = ({ variant = 'basic', ...rest }: AppToastProps) => {
  return variant === 'basic' ? <BasicToast {...rest} /> : <ComplexToast {...rest} />;
};
