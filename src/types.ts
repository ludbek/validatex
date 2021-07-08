export type ErrorMsg = string | Record<string, any>;
export type Context = {
  key?: string;
  index?: number;
  schema?: any;
};
export type Decoder = (value: any, context?: Context) => any;
export interface Switch<T> {
  decoder: T;
}
export type Schema = Record<string, Decoder | Switch<any>>;
export type TypeOf<T extends Decoder> = ReturnType<T>;
export type FilterOptionalKeys<T> = {
  [K in keyof T]: T[K] extends Switch<any> ? K : never;
}[keyof T];
export type FilterRequiredKeys<T> = {
  [K in keyof T]: T[K] extends Switch<any> ? never : K;
}[keyof T];
export type MergeIntersection<T extends Schema> = {
  [K in FilterOptionalKeys<T>]?: T[K] extends Switch<any>
    ? ReturnType<T[K]['decoder']>
    : never;
} &
  { [K in FilterRequiredKeys<T>]: ReturnType<T[K]> };
export type PartialMergeIntersection<T extends Schema> = {
  [K in FilterOptionalKeys<T>]: T[K] extends Switch<any>
    ? ReturnType<T[K]['decoder']>
    : never;
} &
  { [K in FilterRequiredKeys<T>]?: ReturnType<T[K]> };
export interface ObjectType {
  [index: string]: any;
}

export type Validator<T> = (
  val: T,
  context?: Context,
) => string | Record<string, string> | undefined;
export interface DecoderFullOption<T> {
  parse?(val: any): T;
  validate?: Validator<T> | Validator<T>[];
  errorMsg?: string;
  getErrorMsg?: (val: any, context?: Context) => string;
}
export type CustomErrorMsg = string;
export type DecoderOption<T> =
  | Validator<T>
  | Validator<T>[]
  | CustomErrorMsg
  | DecoderFullOption<T>;

export interface DecoderParams<T, U> {
  typeGuard: (rawVal: unknown) => rawVal is T;
  getDefaultErrorMsg: (val: any, context?: Context) => string;
  defaultParser: (rawVal: U) => T | U;
}

export interface ObjectFullOption<T> {
  strict?: boolean;
  unknownFieldErrorMsg?: string;
  validate?: Validator<T> | Validator<T>[];
}
export type ObjectOption<T> = Validator<T> | ObjectFullOption<T>;

export type ValueError = {
  key: string;
  value: any;
  error?: string;
};
