import { Context } from './types';
import { email, length } from './validators';

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
