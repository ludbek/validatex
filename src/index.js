export const SkipValidation = function (message) {
	this.name = "SkipValidation";
	this.message = message;
};

const formatError = (error, data, key) => {
	return error.replace("{value}", data).replace("{key}", key)
}

export const validateSingle = (data, validators, multipleErrors, all, key) => {
	const errors = [];

	if (typeof validators === "function") {
		validators = [validators];
	}

	for(let i = 0; i < validators.length; i++) {
		try {
			let error = validators[i](data, all);
			if (typeof error === "string") {
				const formattedError = formatError(error, data, key)
				if (!multipleErrors) return formattedError;
				errors.push(formattedError);
			}
		}
		catch (err) {
			if (err instanceof SkipValidation) {
				break;
			}
			else {
				throw err
			}
		}
	}
	
	if (errors.length > 0) return errors;

	return null
};

export const validate = (data, validators, multipleErrors) => {
	if (!validators) return;

	let errors = {};
	let noError = true;

	if (typeof validators === "object" && !validators.length) {
		for (let prop in validators) {
			if (validators.hasOwnProperty(prop)) {
				let error = validateSingle(data[prop], validators[prop], multipleErrors, data, prop);

				if (error !== null) {
					noError = false;
				}

				errors[prop] = error;
			}
		}

		return noError? null: errors;
	}

	errors = validateSingle(data, validators, multipleErrors);
	return errors
};

export const avalidateSingle = (data, validators, multipleErrors, all, key) => {
	if (typeof validators === "function") {
		validators = [validators]
	}

	async function v (funcs, errors) {
		if(errors.length > 0) {
			if(!multipleErrors) return errors[0]
		}

		if(funcs.length === 0) {
			return errors.length > 0 ? errors : null
		}

		try {
			const currentValidator = funcs.shift()
			const error = await currentValidator(data, all)
			if(error) {
				errors.push(formatError(error, data, key))
			}
			return v(funcs, errors)
		}
		catch (err) {
			if (err instanceof SkipValidation) {
				if(errors.length > 0) {
					return multipleErrors? errors: errors[0]
				}
				return null
			}
			else {
				throw err
			}
		}
	}

	return v([...validators], [])
}

function getInvalidKeys ({dataKeys, validKeys}) {
	return dataKeys.filter(key => !validKeys.includes(key))
}

const defaultOptions = {
	multipleErrors: false,
	partial: false,
	strict: true,
	invalidKeyError: 'This field is not allowed.'
}

export const avalidate = (data, schema, options = {}) => {
	data = data || {}
	if(!schema) throw new Error("'schema' is required.")
	options = {...defaultOptions, ...options}
	const { multipleErrors, partial, strict, invalidKeyError } = options
	const dataKeys = Object.keys(data)
	let validKeys = Object.keys(schema)
	if(partial) {
		validKeys = validKeys.filter(key => dataKeys.includes(key))
	}

	if(strict) {
		const invalidKeys = getInvalidKeys({dataKeys, validKeys})
		if(invalidKeys.length > 0) {
			return invalidKeys.reduce((a, key) => {
				a[key] = invalidKeyError
				return a
			}, {})
		}
	}

	async function v(keys, errors) {
		if(keys.length === 0) {
			return errors
		}
		const key = keys.shift()
		const error = await avalidateSingle(
			data[key],
			schema[key],
			multipleErrors,
			data,
			key
		)
		if(error) {
			errors = errors || {}
			errors[key] = error
		}
		return v(keys, errors)
	}

	return v(validKeys, null)
}


export const required = (flag, error) => {
	function isNullLike(value) {
		return [undefined, "", null, NaN].includes(value)
	}

	return (value) => {
		if (flag && isNullLike(value)) {
			return error || "This field is required.";
		}
		else if (!flag && isNullLike(value)) {
			// skip rest of the validators
			throw new SkipValidation();
		}
	}
};

export const isNumber = (error) => {
	return (value) => {
		if (typeof value !== "number" || isNaN(value)) {
			return error || "'{value}' is not a valid number.";
		}
	};
};


export const isString = (error) => {
	return (value) => {
		if (typeof value !== "string") {
			return error || "'{value}' is not a valid string.";
		}
	};
};


export const isFunction = (error) => {
	return (value) => {
		if (typeof value !== "function") {
			return error || "Expected a function.";
		}
	}
};


export const isObject = (error) => {
	return (value) => {
		if (value !== Object(value)) {
			return error || "Expected an object.";
		}
	};
};


export const isArray = (error) => {
	return (value) => {
		if (Object.prototype.toString.call(value) !== "[object Array]") {
			return error || "Expected an array.";
		}
	}
};


export const length = (length, error) => {
	return (value) => {
		let str = value + "";
		if (str.length !== length) {
			return error || `It must be ${length} characters long.`;
		}
	};
};


export const isEmail = (error) => {
	return (value) => {
		let pattern = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
		if (!pattern.test(value)) {
			return error || "Invalid email id.";
		}
	};
};


export const equalsTo = (key, error) => {
	return (value, all) => {
		if (value !== all[key]) {
			return error || `'{key}' and '${key}' do not match.`;
		}
	}
}; 


export const minLength = (length, error) => {
	return (value) => {
		let str = value + "";
		if (str.length < length) {
			return error || `It must be at least ${length} characters long.`;
		}
	};
};


export const maxLength = (length, error) => {
	return (value) => {
		let str = value + "";
		if (str.length > length) {
			return error || `It must be at most ${length} characters long.`;
		}
	};
};


export const isBoolean = (error) => {
	return (value) => {
		if (value !== true && value !== false) {
			return error || "Invalid boolean value.";
		}
	};
};

export const within = (list, error) => {
	return (value) => {
		if (!(value instanceof Array)) {
			value = [value];
		}

		let odds = [];

		for(let index = 0; index < value.length; index++) {
			if (list.indexOf(value[index]) === -1) {
				odds.push(value[index]);
			}
		}

		if (odds.length > 0) {
			return error || `[${odds}] do not fall under the allowed list.`;
		}
	};
}

export const excludes = (list, error) => {
	return (value) => {
		if (!(value instanceof Array)) {
			value = [value];
		}

		let odds = [];

		for(let index = 0; index < value.length; index++) {
			if (list.indexOf(value[index]) !== -1) {
				odds.push(value[index]);
			}
		}

		if (odds.length > 0) {
			return error || `[${odds}] fall under restricted values.`;
		}
	};
}

export const pattern = (regex, error) => {
	return (value) => {
		if(!regex.test(value)) {
			return error || "'{value}' does not match with the pattern.";
		}
	};
};
