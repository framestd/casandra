export type Merge<P, T> = Omit<P, keyof T> & T;

export type ExcludeArrayKeys<T> = T extends ArrayLike<any> ? Exclude<keyof T, keyof any[]> : keyof T;

export type IsAny<T> = unknown extends T ? ([keyof T] extends [never] ? false : true) : false;

type PathImpl<T, Key extends keyof T> = Key extends string
  ? IsAny<T[Key]> extends true
    ? never
    : NonNullable<T[Key]> extends Record<string, any>
    ? `${Key}.${PathImpl<T[Key], ExcludeArrayKeys<T[Key]>> & string}` | `${Key}.${ExcludeArrayKeys<T[Key]> & string}`
    : never
  : never;

type PathImpl2<T> = PathImpl<T, keyof T> | keyof T;

// eslint-disable-next-line @typescript-eslint/ban-types
export type AnyString = string & {};

export type Path<T> = keyof T extends string
  ? PathImpl2<T> extends infer P
    ? P extends string | keyof T
      ? P
      : keyof T
    : keyof T
  : never;

export type Choose<T extends Record<string | number, any>, K extends Path<T>> = K extends `${infer U}.${infer Rest}`
  ? Rest extends Path<T[U]>
    ? Choose<T[U], Rest>
    : never
  : T[K];
