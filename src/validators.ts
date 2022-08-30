import { number } from './decoders';
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

 // validator for minimum string length
export function minlength(
  option: number,
  errorMsg?: CustomErrMsg<string, number>,
) {
  return (val: string, context?: Context) => {
    const defaultErrorMsg = `Should be at least ${option} characters long`;
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

 // validator for maximum string length
export function maxlength(
  option: number,
  errorMsg?: CustomErrMsg<string, number>,
) {
  return (val: string, context?: Context) => {
    const defaultErrorMsg = `Should be no longer than ${option} characters`;
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
  const defaultErrorMsg = 'The email is not valid';
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
    const defaultErrorMsg = `Should be ${option} characters long`;
    return val.length !== option
      ? getError({ errorMsg, defaultErrorMsg, val, context, option })
      : undefined;
  };
}

// regex
export function pattern(
  option: RegExp,
  errorMsg?: CustomErrMsg<string, RegExp>
){
  return(val: string, context?: Context): string | undefined => {
    const defaultErrorMsg = `The value ${val} doen't match the pattern ${option}`;
    return option.test(val)
      ?undefined
      :getError({
        errorMsg,
        defaultErrorMsg,
        val,
        context,
        option,
      });
  }
}

 // validator for minimum no of digits in a number
export function min(
  option: number,
  errorMsg?: CustomErrMsg<number, number>,
) {
  return (val: number, context?: Context): string | undefined => {
    const defaultErrorMsg = `Value ${val} should be greater than ${option}`;
    return val < option
      ? getError({ errorMsg, defaultErrorMsg, val, context, option })
      : undefined 
  }
}

 // validator for maximum no of digits in a number
export function max(
  option: number,
  errorMsg?: CustomErrMsg<number, number>,
) {
  return (val: number, context?: Context): string | undefined => {
    const defaultErrorMsg = `Value ${val} should be smaller than ${option}`;
    return val > option
      ? getError({ errorMsg, defaultErrorMsg, val, context, option })
      : undefined 
  }
}

 // minDate
export function minDate(
  option : Date,
  errorMsg?: CustomErrMsg<Date, Date>,
) {
  return (val: Date, context?: Context): string | undefined => {
    const defaultErrorMsg = `The entered date must come after ${option.toDateString()}`
    
    if (option <= val){
      return undefined;
    } else {
      return getError({ errorMsg, defaultErrorMsg, val, context, option })
    }
  }
}

 // maxDate
export function maxDate(
  option : Date,
  errorMsg?: CustomErrMsg<Date, Date>,
) {
  return (val: Date, context?: Context): string | undefined => {
    const defaultErrorMsg = `The entered date must come before ${option.toDateString()}`

    if (option >= val){
      return undefined;
    } else {
      return getError({ errorMsg, defaultErrorMsg, val, context, option })
    }
  }
}

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
