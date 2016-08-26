export const required = (flag, error) => {
	return (value) => {
		if (flag && !value) {
			throw Error(error || "This field is required.");
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
			throw Error(error || "'{value}' is not a valid number.");
		}
	};
};

export const isString = (error) => {
	return (value) => {
		if (typeof value !== "string") {
			throw Error(error || "'{value}' is not a valid string.");
		}
	};
};

export const isFunction = (error) => {
	return (value) => {
		if (typeof value !== "function") {
			throw Error(error || "Expected a function.");
		}
	}
};

export const isObject = (error) => {
	return (value) => {
		if (value !== Object(value)) {
			throw Error(error || "Expected an object.");
		}
	};
};

export const isArray = (error) => {
	return (value) => {
		if (Object.prototype.toString.call(value) !== "[object Array]") {
			throw Error(error || "Expected an array.");
		}
	}
};

export const oneOf = (list, error) => {
	return (value) => {
		let hasAMatch = false;
		for(let i = 0; i < list.length; i ++) {
			if (list[i] === value) {
				hasAMatch = true;
			}
		}
		
		if (!hasAMatch) {
			throw Error(error || "'{value}' does not fall under the given list.");
		}
	};
};

export const noneOf = (list, error) => {
	return (value) => {
		for(let i = 0; i < list.length; i ++) {
			if (list[i] === value) {
				throw Error(error || "'{value}' is not allowed.");
			}
		}
	};
};

export const hasLength = (length, error) => {
	return (value) => {
		let str = value + "";
		if (str.length !== length) {
			throw Error(error || `It must be ${length} digits long.`);
		}
	};
};

export const isEmail = (error) => {
	return (value) => {
		let pattern = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
		if (!pattern.test(value)) {
			throw Error(error || "Invalid email id.");
		}
	};
};

export const equalsTo = (key, error) => {
	return (value, all) => {
		if (value !== all[key]) {
			throw Error(error || `'${value}' is not equal to '${all[key]}'.`);
		}
	}
}; 
