export const SkipValidation = function (message) {
	this.name = "SkipValidation";
	this.message = message;
};

export const validateSingle = (data, validators, multipleErrors, all, key) => {
	let errors = [];

	if (typeof validators === "function") {
		validators = [validators];
	}

	for(let i = 0; i < validators.length; i++) {
		try {
			let error = validators[i](data, all);
			if (typeof error === "string") {
				errors.push(error.replace("{value}", data).replace("{key}", key));
			}
		}
		catch (err) {
			if (err instanceof SkipValidation) {
				break;
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
	function isNullLike(value) {
		return value === undefined || value === "" || value === null;
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
