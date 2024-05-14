import { useCallback, useMemo } from 'react';

import { isFunction } from '@/core/utils';

export function useGroupByFn<T, K extends keyof T>(): (data: T[], key: K) => Map<T[K], T[]>;
export function useGroupByFn<T, V extends T[keyof T]>(): (data: T[], key: (d: T) => V) => Map<V, T[]>;
export function useGroupByFn<T, K extends keyof T, U = T[K]>(): (
  data: T[],
  key: K,
  transform: (v: T[K]) => U,
) => Map<U, T[]>;

export function useGroupByFn<T, K extends keyof T, V extends T[K], U = V>(): (
  data: T[],
  key: (d: T) => V,
  transform: (v: V) => U,
) => Map<U, T[]>;

export function useGroupByFn<T, K extends keyof T, V extends T[K], U = V>() {
  const fn = useCallback((data: T[], key: K | ((d: T) => V), transform: (v: V) => U = (v) => v as unknown as U) => {
    const grouped = new Map<U, T[]>();
    data.forEach((d) => {
      const k = transform(isFunction(key) ? key(d) : (d[key] as V));
      if (grouped.has(k)) {
        return grouped.set(k, grouped.get(k)!.concat(d));
      }
      return grouped.set(k, [d]);
    });

    return grouped;
  }, []);

  return fn;
}

export function useGroupBy<T, K extends keyof T>(data: T[], key: K): Map<T[K], T[]>;
export function useGroupBy<T, V extends T[keyof T]>(data: T[], key: (d: T) => V): Map<V, T[]>;
export function useGroupBy<T, K extends keyof T, U = T[K]>(data: T[], key: K, transform: (v: T[K]) => U): Map<U, T[]>;
export function useGroupBy<T, V extends T[keyof T], U = V>(
  data: T[],
  key: (d: T) => V,
  transform: (v: V) => U,
): Map<U, T[]>;

export function useGroupBy<T, K extends keyof T, V extends T[K], U = T[K]>(
  data: T[],
  key: K | ((d: T) => V),
  transform: (v: T[K]) => U = (v) => v as U,
) {
  const fn = useGroupByFn<T, K, V, U>();
  const grouped = useMemo(
    () => fn(data, isFunction(key) ? key : (_) => key as unknown as V, transform),
    [data, fn, key, transform],
  );

  return grouped;
}
