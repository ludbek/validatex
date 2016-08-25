export const required = (flag, error) => {
	return (data) => {
		if (flag && !data) {
			throw Error(error || "This field is required.");
		}
		else if (!flag && !data) {
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
	return (data) => {
		if (typeof data !== "string") {
			throw Error(error || "'{value}' is not a valid string.");
		}
	};
};

export const isFunction = () => {};
export const isObject = () => {};
export const isArray = () => {};
export const includes = () => {};
export const excludes = () => {};

export const hasLength = (length, error) => {
	return (data) => {
		let str = data + "";
		if (str.length !== length) {
			throw Error(error || `It must be ${length} digits long.`);
		}
	};
};

export const isEmail = () => {};

export const equalsTo = (key, error) => {
	return (data, all) => {
		if (data !== all[key]) {
			throw Error(error || "Values are not equal.");
		}
	}
}; 
