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
    const defaultErrorMsg = `The entered value: ${val} should be at greater than ${option}`;
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
    const defaultErrorMsg = `The entered value: ${val} should be smaller than ${option}`;
    return val > option
      ? getError({ errorMsg, defaultErrorMsg, val, context, option })
      : undefined 
  }
}

  // parses day, month and year from the given date
function parseDate(date: Date): number[] {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  
  const parts = date.toString().split(" ");
  const day = parseInt(parts[2], 10);
  const month = months.indexOf(parts[1]) + 1;
  const year = parseInt(parts[3], 10);
  
  const dateValue:number[] = [day, month, year];
  return dateValue;
}

 // dateFormat
export function validateDate(
  errorMsg?: CustomErrMsg<Date, undefined>,
) {
  return (val: Date, context?: Context): string | undefined => {
    const defaultErrorMsg = `The given date is invalid`
    
    const date = parseDate(val);
    const day = date[0];
    const month = date[1];
    const year = date[2];

     // Check the ranges of month and year
    if(year < 1000 || year > 3000 || month === 0 || month > 12)
      return getError({ errorMsg, defaultErrorMsg, val, context, option:undefined })

    const monthLength = [ 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31 ];

     // Adjust for leap years
    if(year % 400 === 0 || (year % 100 !== 0 && year % 4 === 0))
        monthLength[1] = 29;

     // Check the range of the day
    if (day > 0 && day <= monthLength[month - 1]){
      return undefined;
    }else{
      return getError({ errorMsg, defaultErrorMsg, val, context, option:undefined })
    }
  }
}

 // minDate
export function minDate(
  option : Date,
  errorMsg?: CustomErrMsg<Date, undefined>,
) {
  return (val: Date, context?: Context): string | undefined => {
    const minimum = parseDate(option);
    const minDay = minimum[0];
    const minMonth = minimum[1];
    const minYear = minimum[2];

    const defaultErrorMsg = `The entered date must come after ${minYear}-${minMonth}-${minDay}`

    if (validateDate()(val) !== undefined ){
      return getError({ errorMsg, defaultErrorMsg, val, context, option:undefined })
    }

    const date = parseDate(val);
    const day = date[0];
    const month = date[1];
    const year = date[2];

    if (year > minYear){
      return undefined; 
    }
    else if(year === minYear && month > minMonth )
    {
      return undefined
    }
    else if(year === minYear && month === minMonth && day >= minDay)
    {
      return undefined
    }
    else{
      return getError({ errorMsg, defaultErrorMsg, val, context, option:undefined })
    }
  }
}

 // maxDate
export function maxDate(
  option : Date,
  errorMsg?: CustomErrMsg<Date, undefined>,
) {
  return (val: Date, context?: Context): string | undefined => {
    const maximum = parseDate(option);
    const maxDay = maximum[0];
    const maxMonth = maximum[1];
    const maxYear = maximum[2];

    const defaultErrorMsg = `The entered date must come before ${maxYear}-${maxMonth}-${maxDay}`

    if (validateDate()(val) !== undefined ){
      return getError({ errorMsg, defaultErrorMsg, val, context, option:undefined })
    }

    const date = parseDate(val);
    const day = date[0];
    const month = date[1];
    const year = date[2];

    if (year < maxYear){
      return undefined; 
    }
    else if(year === maxYear && month < maxMonth )
    {
      return undefined
    }
    else if(year === maxYear && month === maxMonth && day <= maxDay)
    {
      return undefined
    }
    else{
      return getError({ errorMsg, defaultErrorMsg, val, context, option:undefined })
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
