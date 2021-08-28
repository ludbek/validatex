import { Decoder, ErrorMsg, Context, TypeOf } from './types';

export type GetErrorMsg<T, O> = ({
  val,
  context,
  option,
}: {
  val: T;
  context?: Context;
  option: O;
}) => string | undefined;

export type CustomErrMsg<T, O> = string | GetErrorMsg<T, O>;

export function getError<T, O>({
  errorMsg,
  defaultErrorMsg,
  val,
  context,
  option,
}: {
  errorMsg?: CustomErrMsg<T, O>;
  defaultErrorMsg: string;
  val: T;
  context?: Context;
  option: O;
}): string | undefined {
  if (typeof errorMsg === 'string') return errorMsg;
  if (typeof errorMsg === 'function') return errorMsg({ val, context, option });
  return defaultErrorMsg;
}

export function minStr(
  option: number,
  errorMsg?: CustomErrMsg<string, number>,
) {
  return (val: string, context?: Context) => {
    const defaultErrorMsg = `Should be at least ${option} characters`;
    if (val.length < option) {
      return getError({
        errorMsg,
        defaultErrorMsg,
        val,
        context,
        option,
      });
    }
  };
}

export function maxStr(
  option: number,
  errorMsg?: CustomErrMsg<string, number>,
) {
  return (val: string, context?: Context) => {
    const defaultErrorMsg = `Should be at least ${option} characters`;
    if (option < val.length) {
      return getError({
        errorMsg,
        defaultErrorMsg,
        val,
        context,
        option,
      });
    }
  };
}

export function email(errorMsg?: CustomErrMsg<string, undefined>) {
  const defaultErrorMsg = 'The email is not valid.';
  return (val: string, context?: Context): string | undefined => {
    const emailRegex =
      /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
    return emailRegex.test(val)
      ? undefined
      : getError({
          errorMsg,
          defaultErrorMsg,
          val,
          context,
          option: undefined,
        });
  };
}

export function length(
  option: number,
  errorMsg?: CustomErrMsg<string, number>,
) {
  return (val: string, context?: Context): string | undefined => {
    const defaultErrorMsg = `Should be ${option} characters`;
    return val.length !== option
      ? getError({ errorMsg, defaultErrorMsg, val, context, option })
      : undefined;
  };
}

// minStr
// maxStr
// regex
// minNum
// maxNum
// date decoder?
// dateFormat
// minDate
// maxDate

export type ValidationSuccess<T> = { success: true; data: T };
export type ValidationFailure = { success: false; error: ErrorMsg };
export type ValidationResult<T> = ValidationSuccess<T> | ValidationFailure;
export function validate(
  decoder: Decoder,
  input: unknown,
): ValidationResult<TypeOf<typeof decoder>> {
  try {
    return {
      success: true,
      data: decoder(input),
    };
  } catch (e) {
    return {
      success: false,
      error: e.error,
    };
  }
}
