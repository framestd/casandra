import { toast, ToastOptions } from 'react-toastify';
import { AppToast, AppToastProps } from './AppToast';

type ToastifyToast<TData = unknown> = Omit<
  typeof toast<TData>,
  // @ts-ignore
  (() => any) | 'info' | 'warn' | 'warning' | 'error' | 'success' | 'loading' | 'dark'
>;

type BaseFunctionType<TData = unknown, TOmit extends keyof AppToastProps = never> = <TData1 = TData>(
  props: Omit<AppToastProps, TOmit>,
  options?: ToastOptions,
) => ReturnType<typeof toast<TData1>>;

interface AppToast<TData = unknown> extends ToastifyToast<TData> {
  <TData = unknown>(props: AppToastProps, options?: ToastOptions): ReturnType<typeof toast<TData>>;
  info: BaseFunctionType<TData, 'type'>;
  warn: BaseFunctionType<TData, 'type'>;
  warning: BaseFunctionType<TData, 'type'>;
  error: BaseFunctionType<TData, 'type'>;
  success: BaseFunctionType<TData, 'type'>;
  loading: BaseFunctionType<TData>;
  dark: BaseFunctionType<TData>;
}

const apptoast = (<TData = unknown,>(props: AppToastProps, options?: ToastOptions) => {
  return toast<TData>(<AppToast {...props} />, options);
}) as AppToast;

apptoast.POSITION = toast.POSITION;
apptoast.TYPE = toast.TYPE;
apptoast.clearWaitingQueue = toast.clearWaitingQueue;
apptoast.dismiss = toast.dismiss;
apptoast.done = toast.done;
apptoast.isActive = toast.isActive;
apptoast.onChange = toast.onChange;
apptoast.promise = toast.promise;
apptoast.update = toast.update;

apptoast.info = <TData = unknown,>(props: Omit<AppToastProps, 'type'>, options?: ToastOptions) => {
  return toast.info<TData>(<AppToast type="info" {...props} />, options);
};

apptoast.warn = <TData = unknown,>(props: Omit<AppToastProps, 'type'>, options?: ToastOptions) => {
  return toast.warn<TData>(<AppToast type="warn" {...props} />, options);
};

apptoast.warning = <TData = unknown,>(props: Omit<AppToastProps, 'type'>, options?: ToastOptions) => {
  return toast.warning<TData>(<AppToast type="warn" {...props} />, options);
};

apptoast.error = <TData = unknown,>(props: Omit<AppToastProps, 'type'>, options?: ToastOptions) => {
  return toast.error<TData>(<AppToast type="error" {...props} />, options);
};

apptoast.success = <TData = unknown,>(props: Omit<AppToastProps, 'type'>, options?: ToastOptions) => {
  return toast.success<TData>(<AppToast type="success" {...props} />, options);
};

apptoast.loading = <TData = unknown,>(props: AppToastProps, options?: ToastOptions) => {
  return toast.loading<TData>(<AppToast {...props} />, options);
};

apptoast.dark = (props: AppToastProps, options?: ToastOptions) => {
  return toast.dark(<AppToast {...props} />, options);
};

export { apptoast as toast };
