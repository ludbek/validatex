// validate(aData, [validators], multipleErrors, allData)

let validateSingle = (data, validators, multipleErrors, all) => {
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
			errors.push(err.message);
		}
	}

	if (multipleErrors) return errors;
	
	if (errors.length > 0) return errors[0];
};


let isEmpty = (errors) => {
	let noError = true;
	for (let prop in errors) {
		if (errors.hasOwnProperty(prop)) {
			if (errors[prop] !== undefined) {
				noError = false;
				break;
			}
		}
	}

	return noError;
}


let validate = (data, validators, multipleErrors) => {
	let errors = {};

	if (validators instanceof Object && !validators.length) {
		for (let prop in validators) {
			if (validators.hasOwnProperty(prop)) {
				errors[prop] = validateSingle(data[prop], validators[prop], multipleErrors, data);
			}
		}

		return isEmpty(errors)? undefined: errors;
	}

	errors = validateSingle(data, validators, multipleErrors);
	return errors
}

export {validate, validateSingle};
