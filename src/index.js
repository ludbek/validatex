
// validate(data, [middlewares], multipleErrors)

let validate = (data, validators, multipleErrors) => {
	let errors = [];

	if (typeof validators === "function") {
		validators = [validators];
	}

	for(let i = 0; i < validators.length; i++) {
		try {
			let cont = validators[i](data);
			if (cont === false) break;
		}
		catch (err) {
			errors.push(err.message);
		}
	}

	if (multipleErrors) return errors;
	
	if (errors.length > 0) return errors[0];
};

export {validate};
