import { useCallback, useMemo } from 'react';

export function usePagedNormalizerFn() {
  return useCallback(<T extends Record<'data', any>>(paged: T[]) => {
    return paged.reduce<T['data']>((result, value) => {
      return result.concat(value.data);
    }, []);
  }, []);
}

export function usePagedNormalizer<T extends Record<'data', any>>(paged: T[]) {
  const normalizer = usePagedNormalizerFn();
  const pages = useMemo(() => normalizer(paged), [normalizer, paged]);

  return pages;
}
