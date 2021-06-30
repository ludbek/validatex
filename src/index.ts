export type ErrorMsg = string | Record<string, any>;
export type Context = {
	key?: string;
	index?: number;
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

export type DecoderValidator<T> = (
	val: T,
	context?: Context,
) => string | Record<string, string> | undefined;
export interface DecoderFullOption<T> {
	parse?(val: any): T;
	validate?: DecoderValidator<T> | DecoderValidator<T>[];
	errorMsg?: string;
	getErrorMsg?: (val: any, context?: Context) => string;
}
export type CustomErrorMsg = string;
export type DecoderOption<T> =
	| DecoderValidator<T>
	| DecoderValidator<T>[]
	| CustomErrorMsg
	| DecoderFullOption<T>;

export function pipe<T>(validators: DecoderValidator<T>[]) {
	return (val: T, context?: Context) => {
		for (const v of validators) {
			const error = v(val, context);
			if (error !== undefined) return error;
		}
	};
}

export function isObject(val: any): val is ObjectType {
	return typeof val === 'object' && val !== null;
}

export function isUndefined(val: any): val is undefined {
	return typeof val === 'undefined';
}

export class ValidationError extends Error {
	readonly error: ErrorMsg;
	constructor(msg: ErrorMsg) {
		super(JSON.stringify(msg));
		this.error = msg;
	}
}

export function toggle<T extends Decoder>(aDecoder: T): Switch<T> {
	return {
		decoder: aDecoder,
	};
}

export function identity<T>(val: T): T {
	return val;
}

function isDecoderValidator<T>(
	decoderOption: any,
): decoderOption is DecoderValidator<T> {
	return typeof decoderOption === 'function';
}

function isCustomErrorMsg(decoderOption: any): decoderOption is CustomErrorMsg {
	return typeof decoderOption === 'string';
}

interface DecoderParams<T, U> {
	typeGuard: (rawVal: unknown) => rawVal is T;
	getDefaultErrorMsg: (val: any, context?: Context) => string;
	defaultParser: (rawVal: U) => T | U;
}
export function decoder<T, U>({
	typeGuard,
	getDefaultErrorMsg,
	defaultParser,
}: DecoderParams<T, U>) {
	return (options: DecoderOption<T> = {}) => {
		return (val: any, context?: Context): T => {
			val = defaultParser(val);
			options = isDecoderValidator<T>(options)
				? { validate: pipe([options]) }
				: options;
			options = Array.isArray(options)
				? { validate: pipe(options) }
				: options;
			options = isCustomErrorMsg(options)
				? { errorMsg: options }
				: options;
			if (Array.isArray(options.validate)) {
				options.validate = pipe(options.validate);
			}
			const { parse, validate, errorMsg, getErrorMsg } = options;
			val = parse ? parse(val) : val;
			if (!typeGuard(val))
				throw new ValidationError(
					errorMsg ||
						(getErrorMsg && getErrorMsg(val, context)) ||
						getDefaultErrorMsg(val, context),
				);
			if (validate) {
				const error = validate(val, context);
				if (error) throw new ValidationError(error);
			}
			return val;
		};
	};
}

export const string = decoder<string, unknown>({
	typeGuard: (val: unknown): val is string => typeof val === 'string',
	getDefaultErrorMsg: () => 'Not a string',
	defaultParser: identity,
});

export const number = decoder<number, unknown>({
	typeGuard: (val: unknown): val is number => typeof val === 'number',
	getDefaultErrorMsg: () => 'Not a number',
	defaultParser: identity,
});

export const boolean = decoder<boolean, unknown>({
	typeGuard: (val: unknown): val is boolean => typeof val === 'boolean',
	getDefaultErrorMsg: () => 'Not a boolean',
	defaultParser: identity,
});

function isDecoder(v: unknown): v is Decoder {
	return typeof v === 'function';
}

export function optional(aDecoder: Decoder) {
	return <T>(val: any, context?: Context): T | undefined => {
		if (val === undefined) return undefined;
		return aDecoder(val, context);
	};
}

type ValueError = {
	key: string;
	value: any;
	error?: string;
};

function mapValueError(data: any) {
	return ([key, aDecoder]: [string, Decoder | Switch<any>]): ValueError => {
		try {
			const actualDecoder = isDecoder(aDecoder)
				? aDecoder
				: optional(aDecoder.decoder);
			return {
				key,
				value: actualDecoder(data[key], { key }),
				error: undefined,
			};
		} catch (e) {
			if (e.error !== undefined) {
				return { key, value: undefined, error: e.error };
			}
			throw e;
		}
	};
}
export function getUnknownFields(inputKeys: string[], schemaKeys: string[]) {
	return inputKeys.filter((key) => !schemaKeys.includes(key));
}

export function constructUnknownFieldsError(
	unknownKeys: string[],
	unknownFieldErrorMsg: string,
) {
	return unknownKeys.reduce(
		(a, k) => ({ ...a, [k]: unknownFieldErrorMsg }),
		{},
	);
}

interface ObjectFullOption<T> {
	strict?: boolean;
	unknownFieldErrorMsg?: string;
	validate?: DecoderValidator<T> | DecoderValidator<T>[];
}
type ObjectOption<T> = DecoderValidator<T> | ObjectFullOption<T>;

const defaultOption = { strict: true, unknownFieldErrorMsg: 'Unknown field.' };
export function object<T extends Schema, U extends MergeIntersection<T>>(
	schema: T,
	option?: ObjectOption<{ [K in keyof U]: U[K] }>,
) {
	return (rawData: any, context?: Context): { [K in keyof U]: U[K] } => {
		rawData = isObject(rawData) ? rawData : {};

		// convert option to ObjectFullOption
		option = isDecoderValidator(option) ? { validate: option } : option;
		option = isUndefined(option)
			? defaultOption
			: { ...defaultOption, ...option };
		if (Array.isArray(option.validate)) {
			option.validate = pipe(option.validate);
		}
		const { validate, strict, unknownFieldErrorMsg } = option as any;

		// handle unknown fields
		if (strict) {
			const unknownKeys = getUnknownFields(
				Object.keys(rawData),
				Object.keys(schema),
			);
			if (unknownKeys.length !== 0) {
				throw new ValidationError(
					constructUnknownFieldsError(
						unknownKeys,
						unknownFieldErrorMsg,
					),
				);
			}
		}

		// handle known fields
		const { data, error } = Object.entries(schema)
			.map(mapValueError(rawData))
			.reduce(
				(a, valueError) => {
					const { key, value, error: anError } = valueError;
					if (anError !== undefined) {
						return { ...a, error: { ...a.error, [key]: anError } };
					}
					return { ...a, data: { ...a.data, [key]: value } };
				},
				{ data: {}, error: {} },
			);

		if (Object.keys(error).length !== 0) throw new ValidationError(error);

		if (validate) {
			const err = validate(data as any, context);
			if (err) throw new ValidationError(err);
		}
		return data as any;
	};
}

export function partial<
	T extends Schema,
	U extends PartialMergeIntersection<T>,
>(schema: T, customValidator?: DecoderValidator<{ [K in keyof U]: U[K] }>) {
	schema = Object.keys(schema).reduce((a, k) => {
		let aDecoder = schema[k];
		aDecoder = isDecoder(aDecoder) ? optional(aDecoder) : aDecoder.decoder;
		return { ...a, [k]: aDecoder };
	}, {}) as any;
	return (val: any, context?: Context): { [K in keyof U]: U[K] } => {
		return object(schema, customValidator)(val, context) as any;
	};
}

export function array<T extends Decoder>(
	schema: T,
	customValidator?:
		| DecoderValidator<ReturnType<T>[]>
		| DecoderValidator<ReturnType<T>[]>[],
) {
	return (data: any, context?: Context): ReturnType<T>[] => {
		data = Array.isArray(data) ? data : [undefined];
		data = data.length === 0 ? [undefined] : data;
		const processedData = [];
		const errors: Record<string, any>[] = [];
		data.forEach((datum: any, index: number) => {
			try {
				processedData.push(schema(datum, { index }));
			} catch (e) {
				if (e.error !== undefined) {
					errors.push({ _index: index, error: e.error });
				} else {
					throw e;
				}
			}
		});

		if (errors.length !== 0) {
			throw new ValidationError(errors);
		}
		if (Array.isArray(customValidator)) {
			customValidator = pipe(customValidator);
		}
		if (customValidator) {
			const err = customValidator(data, context);
			if (err) throw new ValidationError(err);
		}
		return data;
	};
}

export function nullable<T extends Decoder>(aDecoder: T) {
	return (val: any): ReturnType<T> | null => {
		if (val === null) return null;
		return aDecoder(val);
	};
}
