import {
	string,
	optional,
	number,
	object,
	array,
	boolean,
	partial,
	toggle,
	decoder,
	identity,
	ValidationError,
} from './index';

describe('decoder', () => {
	it('works without any option', () => {
		const defaultErrorMsg = 'Not a string';
		const str = decoder<string, unknown>({
			typeGuard: (val: unknown): val is string => typeof val === 'string',
			defaultErrorMsg: () => defaultErrorMsg,
			defaultParser: identity,
		});

		const nameSchema = str();
		expect(nameSchema('foo')).toEqual('foo');
		expect(nameSchema.bind(nameSchema, 1)).toThrow(defaultErrorMsg);
	});

	it('works with DecoderFullOption', () => {
		const defaultErrorMsg = 'Not a string';
		const customErrorMsg = 'It should be a string.';
		const customValidationErrorMsg = "must not contain '-'.";
		const str = decoder<string, unknown>({
			typeGuard: (val: unknown): val is string => typeof val === 'string',
			defaultErrorMsg: () => defaultErrorMsg,
			defaultParser: identity,
		});
		const alphaNumSchema = str({
			parse(val) {
				if (typeof val === 'string' || typeof val === 'number')
					return `${val}`;
				return val;
			},
			validate(val, { key } = { key: undefined }) {
				if (val.includes('-'))
					throw new ValidationError(
						`${key} ${customValidationErrorMsg}`,
					);
			},
			errorMsg: customErrorMsg,
		});
		expect(alphaNumSchema('valid string')).toEqual('valid string');
		// it parses
		expect(alphaNumSchema(1)).toEqual('1');
		// it respects custom error msg
		expect(alphaNumSchema.bind(alphaNumSchema, true)).toThrow(
			customErrorMsg,
		);
		// it respects custom validator
		expect(
			alphaNumSchema.bind(alphaNumSchema, 'hello-there', { key: 'akey' }),
		).toThrow(customValidationErrorMsg);

		// it respects getErrorMsg
		const schema = str({
			getErrorMsg: (val, { key } = { key: undefined }) => {
				return `${key} must not be ${val}`;
			},
		});
		expect(schema.bind(schema, 1, { key: 'akey' })).toThrow(
			'akey must not be 1',
		);
	});

	it('works with DecoderValidator', () => {
		const defaultErrorMsg = 'Not a string';
		const str = decoder<string, unknown>({
			typeGuard: (val: unknown): val is string => typeof val === 'string',
			defaultErrorMsg: () => defaultErrorMsg,
			defaultParser: identity,
		});
		const fooSchema = str((val) => {
			if (val !== 'foo') throw new ValidationError("Its not 'foo'.");
		});
		expect(fooSchema.bind(fooSchema, 'bar')).toThrow("Its not 'foo'.");
	});

	it('works with CustomErrorMsg', () => {
		const defaultErrorMsg = 'Not a string';
		const str = decoder<string, unknown>({
			typeGuard: (val: unknown): val is string => typeof val === 'string',
			defaultErrorMsg: () => defaultErrorMsg,
			defaultParser: identity,
		});
		const customErrorMsg = 'A custom error msg.';
		const fooSchema = str(customErrorMsg);
		expect(fooSchema.bind(fooSchema, 1)).toThrow(customErrorMsg);
	});
});

describe('string', () => {
	it('throws an error is a value is not a string', () => {
		function run() {
			return string()(1);
		}
		expect(run).toThrow('Not a string');
	});

	it('returns the value if it is a string', () => {
		const val = 'a string';
		expect(string()(val)).toEqual(val);
	});
});

describe('number', () => {
	it('throws an error is a value is not a string', () => {
		function run() {
			return number()('a string');
		}
		expect(run).toThrow('Not a number');
	});

	it('returns the value if it is a string', () => {
		const val = 1;
		expect(number()(val)).toEqual(val);
	});
});

describe('boolean', () => {
	it('throws an error if a value is not a boolean', () => {
		const boolSchema = boolean();
		expect(boolSchema.bind(boolSchema, 1)).toThrow('Not a boolean');
	});

	it('returns value if it is a boolean', () => {
		const boolSchema = boolean();
		expect(boolSchema(false)).toEqual(false);
		expect(boolSchema(true)).toEqual(true);
	});
});

describe('object', () => {
	it('returns a value if its valid', () => {
		const userSchema = object({ name: string(), address: string() });
		const val = { name: 'foo', address: 'bar' };
		expect(userSchema(val)).toEqual(val);
	});

	it('throws the errors if a value is invalid', () => {
		const userSchema = object({ name: string(), address: string() });
		const val = {};
		function run() {
			return userSchema(val);
		}
		expect(run).toThrow('{"name":"Not a string","address":"Not a string"}');
	});

	it('validates non objects', () => {
		const userSchema = object({ name: string(), address: string() });
		expect(userSchema.bind(userSchema, undefined)).toThrow(
			'{"name":"Not a string","address":"Not a string"}',
		);
		expect(userSchema.bind(userSchema, 1)).toThrow(
			'{"name":"Not a string","address":"Not a string"}',
		);
	});

	it('respects custom validator', () => {
		const expectedError = { confirm: 'It must match "password".' };
		const customValidator = (val: {
			password: string;
			confirm: string;
		}) => {
			const { password, confirm } = val;
			if (password !== confirm) {
				throw new ValidationError(expectedError);
			}
		};
		const signupSchema = object(
			{
				username: string(),
				password: string(),
				confirm: string(),
			},
			customValidator,
		);
		const rawData = {
			username: 'ausername',
			password: 'apassword',
			confirm: 'bpassword',
		};
		expect(signupSchema.bind(signupSchema, rawData)).toThrow(
			JSON.stringify(expectedError),
		);
	});

	it('throws if unknown fields are passed', () => {
		const loginSchema = object({
			username: string(),
			password: string(),
		});
		const data = {
			username: 'a username',
			password: 'a password',
			unknownField1: 'unknown field 1',
			unknownField2: 'unknown field 2',
		};
		const expectedError =
			'{"unknownField1":"Unknown field.","unknownField2":"Unknown field."}';
		expect(loginSchema.bind(loginSchema, data)).toThrow(expectedError);
	});

	it('respects "unknownFieldErrorMsg" option', () => {
		const loginSchema = object(
			{
				username: string(),
				password: string(),
			},
			{ unknownFieldErrorMsg: 'This field is not allowed.' },
		);
		const data = {
			username: 'a username',
			password: 'a password',
			unknownField1: 'unknown field 1',
			unknownField2: 'unknown field 2',
		};
		const expectedError =
			'{"unknownField1":"This field is not allowed.","unknownField2":"This field is not allowed."}';
		expect(loginSchema.bind(loginSchema, data)).toThrow(expectedError);
	});

	it('does not throw if strict is false', () => {
		const loginSchema = object(
			{
				username: string(),
				password: string(),
			},
			{ strict: false },
		);
		const data = {
			username: 'a username',
			password: 'a password',
			unknownField1: 'unknown field 1',
			unknownField2: 'unknown field 2',
		};
		expect(loginSchema(data)).toEqual(
			expect.objectContaining({
				username: data.username,
				password: data.password,
			}),
		);
	});
});

describe('array', () => {
	it('returns value if valid', () => {
		const namesSchema = array(string());
		const value = ['foo', 'bar'];
		expect(namesSchema(value)).toEqual(value);
	});

	it('throws error if a value is invalid', () => {
		const namesSchema = array(string());
		const value = [1, undefined];
		const expectedError = [
			{ _index: 0, error: 'Not a string' },
			{ _index: 1, error: 'Not a string' },
		];
		expect(namesSchema.bind(namesSchema, value)).toThrow(
			JSON.stringify(expectedError),
		);
	});

	it('validates non array value', () => {
		const namesSchema = array(string());
		const expectedError = [{ _index: 0, error: 'Not a string' }];
		expect(namesSchema.bind(namesSchema, undefined)).toThrow(
			JSON.stringify(expectedError),
		);
	});

	it('validates empty array', () => {
		const namesSchema = array(string());
		const expectedError = [{ _index: 0, error: 'Not a string' }];
		expect(namesSchema.bind(namesSchema, [])).toThrow(
			JSON.stringify(expectedError),
		);
	});

	it('validates empty array', () => {
		const expectedError = 'Only 2 items are allowed';
		function allowOnly2(values: string[]) {
			if (values.length > 2) throw new ValidationError(expectedError);
		}
		const namesSchema = array(string(), allowOnly2);
		expect(namesSchema.bind(namesSchema, ['a', 'b', 'c', 'd'])).toThrow(
			JSON.stringify(expectedError),
		);
	});
});

describe('optional', () => {
	it('returns undefined if the given value is undefined', () => {
		expect(optional(string())(undefined)).toEqual(undefined);
	});

	it('returns a value if the given value is not a undefined', () => {
		const val = 'a string';
		expect(optional(string())(val)).toEqual(val);
	});
});

describe('partial', () => {
	it('makes all the fields optional', () => {
		const userSchema = partial({
			username: string(),
			password: string(),
		});
		expect(userSchema({})).toEqual({});
	});

	it('works with toggle', () => {
		const userSchema = partial({
			username: string(),
			password: toggle(string()),
		});
		expect(userSchema.bind(userSchema, {})).toThrow('');
	});

	it('makes all the fields optional', () => {
		const expectedError = {
			displayError: '"username" and "password" cannot be same.',
		};
		function customValidator({
			username,
			password,
		}: {
			username: string;
			password: string;
		}) {
			if (username === password) throw new ValidationError(expectedError);
		}
		const userSchema = partial(
			{
				username: string(),
				password: string(),
			},
			customValidator,
		);
		const data = { username: 'a', password: 'a' };
		expect(userSchema.bind(userSchema, data)).toThrow(
			JSON.stringify(expectedError),
		);
	});
});

describe('kitchen sink', () => {
	it('works', () => {
		const userSchema = array(
			object({
				name: string(),
				mobile: toggle(number()),
				address: partial({
					postcode: number(),
					street1: string(),
					street2: toggle(string()),
				}),
			}),
		);

		const value1 = [
			{
				name: 'foo',
				mobile: 1234567890,
				address: {
					postcode: 1,
					street1: 'street 1',
					street2: 'street 2',
				},
			},
		];
		expect(userSchema(value1)).toEqual(value1);
		const value2 = [
			{
				name: 'foo',
				mobile: 1234567890,
				address: {
					postcode: 1,
					street1: 'street 1',
					street2: 'street 2',
				},
			},
			{
				address: { street1: 'street 1' },
			},
		];
		const expectedError2 =
			'[{"_index":1,"error":{"name":"Not a string","address":{"street2":"Not a string"}}}]';
		expect(userSchema.bind(userSchema, value2)).toThrow(expectedError2);
	});
});
