import { Context } from './types';
import { dateFormat, email, length, max, maxlength, min, minlength, pattern } from './validators';

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
    const expectedError = `Invalid characters in input`;
    expect(pattern(/^[a-b]/)('z')).toEqual(expectedError);
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
    const length = 3
    const expectedError = `Should be no longer than ${length} characters`;
    expect(maxlength(length)("suku")).toEqual(expectedError);
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
    const digit = 5;
    const expectedError = `Should be at least ${digit} digits long`;
    expect(min(digit)(4037)).toEqual(expectedError);
  });
  it('returns undefined', () => {
    expect(min(5)(348453)).toEqual(undefined);
  });
  it('considers errorMsg', () => {
    const errorMsg = 'Custom error.';
    expect(min(6, errorMsg)(4037)).toEqual(errorMsg);
  });
})

// max validator
describe('max', () => {
  it('returns error', () => {
    const digit = 3;
    const expectedError = `Should be no longer than ${digit} digits`;
    expect(max(digit)(4037)).toEqual(expectedError);
  });
  it('returns undefined', () => {
    expect(max(6)(348453)).toEqual(undefined);
  });
  it('considers errorMsg', () => {
    const digit = 3;
    const errorMsg = `There must not be more than ${digit} digits)`;
    expect(max(digit, errorMsg)(4037)).toEqual(errorMsg);
  });
})

// date format validator
describe('dateFormat', () => {
  it('returns error', () => {
    const expectedError = `Doesn't match the date format of MM/DD/YYYY`;
    expect(dateFormat('MM/DD/YYYY')('13/04/2021')).toEqual(expectedError);
  });
  it('returns invalid format error', () => {
    const expectedError = `Invalid date format specified`;
    expect(dateFormat('MM/DD/YYY')('12/04/2021')).toEqual(expectedError);
  });
  it('returns undefined', () => {
    expect(dateFormat('MM/DD/YYYY')('12/05/2021')).toEqual(undefined);
  });
  it('considers errorMsg', () => {
    const option = 'YYYY/MM/DD';
    const errorMsg = `The date entered doesn't match the format ${option}`;
    expect(dateFormat(option, errorMsg)('04/13/2021')).toEqual(errorMsg);
  });
})