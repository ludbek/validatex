// validate(aData, [validators], multipleErrors, allData)

let validateSingle = (data, validators, multipleErrors, all, key) => {
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
			errors.push(err.message.replace("{value}", data).replace("{key}", key));
		}
	}

	if (multipleErrors) return errors;
	
	if (errors.length > 0) return errors[0];
};


let validate = (data, validators, multipleErrors) => {
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
}

export {validate, validateSingle};
