export const ValidationError = function (message) {
	this.name = "ValidationError";
	this.message = message;
};

export const validateSingle = (data, validators, multipleErrors, all, key) => {
	let errors = [];

	if (typeof validators === "function") {
		validators = [validators];
	}

	for(let i = 0; i < validators.length; i++) {
		try {
			let cont = validators[i](data, all);
			if (cont === false) break;
		}
		catch (err) {
			if (err instanceof ValidationError) {
				errors.push(err.message.replace("{value}", data).replace("{key}", key));
			}
		}
	}

	if (multipleErrors === true) return errors;
	
	if (errors.length > 0) return errors[0];
};


export const validate = (data, validators, multipleErrors) => {
	if (!validators) return;

	let errors = {};
	let noError = true;

	if (typeof validators === "object" && !validators.length) {
		for (let prop in validators) {
			if (validators.hasOwnProperty(prop)) {
				let error = validateSingle(data[prop], validators[prop], multipleErrors, data, prop);

				if (error !== undefined) {
					noError = false;
				}

				errors[prop] = error;
			}
		}

		return noError? undefined: errors;
	}

	errors = validateSingle(data, validators, multipleErrors);
	return errors
};


export const required = (flag, error) => {
	return (value) => {
		if (flag && !value) {
			throw new ValidationError(error || "This field is required.");
		}
		else if (!flag && !value) {
			// skip rest of the validators
			return false;
		}
	}
};

export const isNumber = (error) => {
	return (value) => {
		if (typeof value !== "number" || isNaN(value)) {
			throw new ValidationError(error || "'{value}' is not a valid number.");
		}
	};
};

export const isString = (error) => {
	return (value) => {
		if (typeof value !== "string") {
			throw new ValidationError(error || "'{value}' is not a valid string.");
		}
	};
};

export const isFunction = (error) => {
	return (value) => {
		if (typeof value !== "function") {
			throw new ValidationError(error || "Expected a function.");
		}
	}
};

export const isObject = (error) => {
	return (value) => {
		if (value !== Object(value)) {
			throw new ValidationError(error || "Expected an object.");
		}
	};
};

export const isArray = (error) => {
	return (value) => {
		if (Object.prototype.toString.call(value) !== "[object Array]") {
			throw new ValidationError(error || "Expected an array.");
		}
	}
};

export const oneOf = (list, error) => {
	console.log("Warning: 'oneOf' has been deprecated, please use 'within' instead.");
	return (value) => {
		if (list.indexOf(value) === -1) {
			throw new ValidationError(error || "'{value}' does not fall under the given list.");
		}
	};
};

export const noneOf = (list, error) => {
	console.log("Warning: 'noneOf' has been deprecated, please use 'excludes' instead.");
	return (value) => {
		for(let i = 0; i < list.length; i ++) {
			if (list[i] === value) {
				throw new ValidationError(error || "'{value}' is not allowed.");
			}
		}
	};
};

export const length = (length, error) => {
	return (value) => {
		let str = value + "";
		if (str.length !== length) {
			throw new ValidationError(error || `It must be ${length} characters long.`);
		}
	};
};

export const isEmail = (error) => {
	return (value) => {
		let pattern = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
		if (!pattern.test(value)) {
			throw new ValidationError(error || "Invalid email id.");
		}
	};
};

export const equalsTo = (key, error) => {
	return (value, all) => {
		if (value !== all[key]) {
			throw new ValidationError(error || `'{key}' and '${key}' do not match.`);
		}
	}
}; 

export const minLength = (length, error) => {
	return (value) => {
		let str = value + "";
		if (str.length < length) {
			throw new ValidationError(error || `It must be at least ${length} characters long.`);
		}
	};
};

export const maxLength = (length, error) => {
	return (value) => {
		let str = value + "";
		if (str.length > length) {
			throw new ValidationError(error || `It must be at most ${length} characters long.`);
		}
	};
};


export const isBoolean = (error) => {
	return (value) => {
		if (value !== true && value !== false) {
			throw new ValidationError(error || "Invalid boolean value.");
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
			throw new ValidationError(error || `[${odds}] do not fall under the allowed list.`);
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
			throw new ValidationError(error || `[${odds}] fall under restricted values.`);
		}
	};
}

