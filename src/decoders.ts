import {
	DecoderValidator,
	Context,
	ObjectType,
	ErrorMsg,
	Decoder,
	Switch,
	CustomErrorMsg,
	DecoderParams,
	Schema,
	MergeIntersection,
	PartialMergeIntersection,
	DecoderOption,
	ValueError,
	ObjectOption,
} from './types';

function pipe<T>(validators: DecoderValidator<T>[]) {
	return (val: T, context?: Context) => {
		for (const v of validators) {
			const error = v(val, context);
			if (error !== undefined) return error;
		}
	};
}

function isObject(val: any): val is ObjectType {
	return typeof val === 'object' && val !== null;
}

function isUndefined(val: any): val is undefined {
	return typeof val === 'undefined';
}

class ValidationError extends Error {
	readonly error: ErrorMsg;
	constructor(msg: ErrorMsg) {
		super(JSON.stringify(msg));
		this.error = msg;
	}
}

function toggle<T extends Decoder>(aDecoder: T): Switch<T> {
	return {
		decoder: aDecoder,
	};
}

function identity<T>(val: T): T {
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

function decoder<T, U>({
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

function isDecoder(v: unknown): v is Decoder {
	return typeof v === 'function';
}
function optional(aDecoder: Decoder) {
	return <T>(val: any, context?: Context): T | undefined => {
		if (val === undefined) return undefined;
		return aDecoder(val, context);
	};
}

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
function getUnknownFields(inputKeys: string[], schemaKeys: string[]) {
	return inputKeys.filter((key) => !schemaKeys.includes(key));
}

function constructUnknownFieldsError(
	unknownKeys: string[],
	unknownFieldErrorMsg: string,
) {
	return unknownKeys.reduce(
		(a, k) => ({ ...a, [k]: unknownFieldErrorMsg }),
		{},
	);
}

const dString = decoder<string, unknown>({
	typeGuard: (val: unknown): val is string => typeof val === 'string',
	getDefaultErrorMsg: () => 'Not a string',
	defaultParser: identity,
});

const dNumber = decoder<number, unknown>({
	typeGuard: (val: unknown): val is number => typeof val === 'number',
	getDefaultErrorMsg: () => 'Not a number',
	defaultParser: identity,
});

const dBoolean = decoder<boolean, unknown>({
	typeGuard: (val: unknown): val is boolean => typeof val === 'boolean',
	getDefaultErrorMsg: () => 'Not a boolean',
	defaultParser: identity,
});

const defaultOption = { strict: true, unknownFieldErrorMsg: 'Unknown field.' };
function object<T extends Schema, U extends MergeIntersection<T>>(
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

function partial<T extends Schema, U extends PartialMergeIntersection<T>>(
	schema: T,
	customValidator?: DecoderValidator<{ [K in keyof U]: U[K] }>,
) {
	schema = Object.keys(schema).reduce((a, k) => {
		let aDecoder = schema[k];
		aDecoder = isDecoder(aDecoder) ? optional(aDecoder) : aDecoder.decoder;
		return { ...a, [k]: aDecoder };
	}, {}) as any;
	return (val: any, context?: Context): { [K in keyof U]: U[K] } => {
		return object(schema, customValidator)(val, context) as any;
	};
}

function array<T extends Decoder>(
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

function nullable<T extends Decoder>(aDecoder: T) {
	return (val: any): ReturnType<T> | null => {
		if (val === null) return null;
		return aDecoder(val);
	};
}

function dEnum() {
	console.log('yo');
}

export {
	decoder,
	identity,
	dString as string,
	dNumber as number,
	dBoolean as boolean,
	object,
	partial,
	array,
	nullable,
	optional,
	toggle,
	dEnum as enum,
};
