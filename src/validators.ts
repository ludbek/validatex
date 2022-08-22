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

//validator for minimum string length
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

//validator for maximum string length
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
  const defaultErrorMsg = 'Invalid characters in input';
  return(val: string, context?: Context): string | undefined => {
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
    const defaultErrorMsg = `Should be at least ${option} digits long`;
    const num = val.toString()
    return num.length < option
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
    const defaultErrorMsg = `Should be no longer than ${option} digits`;
    const num = val.toString()
    return num.length > option
      ? getError({ errorMsg, defaultErrorMsg, val, context, option })
      : undefined 
  }
}

// dateFormat
export function dateFormat(
  option: string,
  errorMsg?: CustomErrMsg<string, string>,
) {
  return (val: string, context?: Context): string | undefined => {
    const defaultErrorMsg = `Doesn't match the date format of ${option}`
    let dateRegex:RegExp = /^/;
    let posYear = 0;
    let posMonth = 0;
    let posDay = 0;

    switch(option){
      case "MM/DD/YYYY":
        dateRegex = /^\d{1,2}\/\d{1,2}\/\d{4}$/;
        posDay = 1;
        posYear = 2;
        break;
        
      case "DD/MM/YYYY":
        dateRegex = /^\d{1,2}\/\d{1,2}\/\d{4}$/;
        posMonth = 1;
        posYear = 2;
        break;
        
      case "YYYY/MM/DD":
        dateRegex = /^\d{4}\/\d{1,2}\/\d{1,2}$/;
        posMonth = 1;
        posDay = 2;
        break;

      default:
        let defaultErrorMsg = "Invalid date format specified"
        return getError({ errorMsg, defaultErrorMsg, val, context, option })
    }

    if (!dateRegex.test(val)) 
      return getError({ errorMsg, defaultErrorMsg, val, context, option })
      
    //Parsing the date part to integers
    var parts = val.split("/");
    var day = parseInt(parts[posDay], 10);
    var month = parseInt(parts[posMonth], 10);
    var year = parseInt(parts[posYear], 10);

    //Check the ranges of month and year
    if(year < 1000 || year > 3000 || month == 0 || month > 12)
      return getError({ errorMsg, defaultErrorMsg, val, context, option })

    var monthLength = [ 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31 ];

    // Adjust for leap years
    if(year % 400 == 0 || (year % 100 != 0 && year % 4 == 0))
        monthLength[1] = 29;

    // Check the range of the day
    if (day > 0 && day <= monthLength[month - 1]){
      return undefined;
    }else{
      return getError({ errorMsg, defaultErrorMsg, val, context, option })
    }
  }
}

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
