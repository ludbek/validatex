import { Context } from './types';
import { email, length, max, maxDate, maxlength, min, minDate, minlength, pattern, validateDate } from './validators';

 // Email Validator
describe('email', () => {
  it('returns error if an email is invalid', () => {
    expect(email()('aninvalid.email')).toEqual('The email is not valid');
  });

  it('returns undefined if an email is valid', () => {
    expect(email()('someone@somewhere.com')).toEqual(undefined);
  });

  it('considers errorMsg', () => {
    const errorMsg = 'Custom error.';
    expect(email(errorMsg)('aninvalid.email')).toEqual(errorMsg);
  });

  it('considers getErrorMsg', () => {
    const getErrorMsg = ({
      val,
      context,
    }: {
      val: string;
      context?: Context;
    }) => {
      const { key: akey } = context!;
      return `'${akey}' has an invalid value '${val}'`;
    };

    const key = 'email';
    const value = 'aninvalid.email';
    const expectedError = `'${key}' has an invalid value '${value}'`;
    expect(email(getErrorMsg)(value, { key })).toEqual(expectedError);
  });
});

 // Length validator
describe('length', () => {
  it('returns error', () => {
    const expectedError = `Should be ${5} characters long`;
    expect(length(5)('1234')).toEqual(expectedError);
  });

  it('returns undefined', () => {
    expect(length(1)('1')).toEqual(undefined);
  });

  it('considers errorMsg', () => {
    const errorMsg = 'Custom error.';
    expect(length(5, errorMsg)('1')).toEqual(errorMsg);
  });

  it('considers getErrorMsg', () => {
    const getErrorMsg = ({
      val,
      context,
    }: {
      val: string;
      context?: Context;
    }) => {
      const { key: akey } = context!;
      return `'${akey}' has invalid length of ${val.length}.`;
    };
    const key = 'akey';
    const expectedError = `'${key}' has invalid length of 2.`;
    const got = length(1, getErrorMsg)('ab', { key });
    expect(got).toEqual(expectedError);
  });
});

 // Pattern validator
describe('pattern', () => {
  it('returns error', () => {
    const val = 'z';
    const option = /^[a-b]/;
    const expectedError = `The value ${val} doen't match the pattern ${option}`;
    expect(pattern(option)(val)).toEqual(expectedError);
  });
  it('returns undefined', () => {
    expect(pattern(/^[a-z0-9]*$/)('12ba')).toEqual(undefined);
  });
  it('considers errorMsg', () => {
    const errorMsg = 'Custom error.';
    expect(pattern(/^[a-z0-9]*$/, errorMsg)('abc_123')).toEqual(errorMsg);
  });
})

 // minlength validator
describe('minlength', () => {
  it('returns error', () => {
    const expectedError = `Should be at least ${5} characters long`;
    expect(minlength(5)("suku")).toEqual(expectedError);
  });
  it('returns undefined', () => {
    expect(minlength(5)("summit")).toEqual(undefined);
  });
  it('considers errorMsg', () => {
    const errorMsg = 'Custom error.';
    expect(minlength(6, errorMsg)("suku")).toEqual(errorMsg);
  });
})

 // maxlength validator
describe('maxlength', () => {
  it('returns error', () => {
    const len = 3;
    const expectedError = `Should be no longer than ${len} characters`;
    expect(maxlength(len)("suku")).toEqual(expectedError);
  });
  it('returns undefined', () => {
    expect(maxlength(6)("summit")).toEqual(undefined);
  });
  it('considers errorMsg', () => {
    const errorMsg = 'Custom error.';
    expect(maxlength(3, errorMsg)("suku")).toEqual(errorMsg);
  });
})

 // min validator
describe('min', () => {
  it('returns error', () => {
    const val = 12
    const minVal = 15;
    const expectedError = `The entered value: ${val} should be at greater than ${minVal}`;
    expect(min(minVal)(val)).toEqual(expectedError);
  });
  it('returns undefined', () => {
    expect(min(15)(17)).toEqual(undefined);
  });
  it('considers errorMsg', () => {
    const errorMsg = 'Custom error.';
    expect(min(6, errorMsg)(5)).toEqual(errorMsg);
  });
})

 // max validator
describe('max', () => {
  it('returns error', () => {
    const val = 15;
    const maxVal = 12;
    const expectedError = `The entered value: ${val} should be smaller than ${maxVal}`;
    expect(max(maxVal)(val)).toEqual(expectedError);
  });
  it('returns undefined', () => {
    expect(max(6)(4)).toEqual(undefined);
  });
  it('considers errorMsg', () => {
    const maxVal = 3;
    const errorMsg = `Number smaller than ${maxVal} is expected`;
    expect(max(maxVal, errorMsg)(5)).toEqual(errorMsg);
  });
})

 // date validator
describe('validateDate', () => {
  it('returns error', () => {
    const expectedError = `The given date is invalid`;
    expect(validateDate()(new Date("2021/13/4"))).toEqual(expectedError);
  });
  it('returns undefined', () => {
    expect(validateDate()(new Date("2021-12-5"))).toEqual(undefined);
  });
  it('considers errorMsg', () => {
    const errorMsg = `The date entered doesn't exist.`;
    expect(validateDate(errorMsg)(new Date("14/5/2021"))).toEqual(errorMsg);
  });
})

 // min date validator
describe('minDate', () => {
  it('returns error', () => {
    const expectedError = `The entered date must come after 2021-4-5`;
    expect(minDate(new Date("2021/4/5"))(new Date("2021/3/4"))).toEqual(expectedError);
  });
  it('returns undefined', () => {
    expect(minDate(new Date("2021/4/5"))(new Date("2021/4/6"))).toEqual(undefined);
  });
  it('considers errorMsg', () => {
    const errorMsg = `The date entered doesn't exist.`;
    expect(minDate(new Date("2021/4/5"), errorMsg)(new Date("2020/4/6"))).toEqual(errorMsg);
  });
})

 // max date validator
describe('maxDate', () => {
  it('returns error', () => {
    const expectedError = `The entered date must come before 2021-4-5`;
    expect(maxDate(new Date("2021/4/5"))(new Date("2021/6/4"))).toEqual(expectedError);
  });
  it('returns undefined', () => {
    expect(maxDate(new Date("2021/4/5"))(new Date("2020/5/6"))).toEqual(undefined);
  });
  it('considers errorMsg', () => {
    const errorMsg = `The date entered doesn't exist.`;
    expect(maxDate(new Date("2021/4/5"), errorMsg)(new Date("2022/4/6"))).toEqual(errorMsg);
  });
})