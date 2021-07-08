import { Context } from './types';

export interface ValidatorParam {
  errorMsg?: string;
  getErrorMsg?: (val: string, context?: Context) => string;
}

export interface EmailParam extends ValidatorParam {}

export function email({ errorMsg, getErrorMsg }: EmailParam) {
  return (val: string, context?: Context): string | undefined => {
    const emailRegex =
      /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
    return emailRegex.test(val)
      ? undefined
      : errorMsg ??
          ((getErrorMsg && getErrorMsg(val, context)) ||
            'The email is not valid.');
  };
}

export interface LengthParam extends ValidatorParam {
  len: number;
}

export function length({ len, errorMsg, getErrorMsg }: LengthParam) {
  return (val: string, context?: Context): string | undefined => {
    return val.length !== len
      ? errorMsg ??
          ((getErrorMsg && getErrorMsg(val, context)) ||
            `It must be ${len} characters long.`)
      : undefined;
  };
}
