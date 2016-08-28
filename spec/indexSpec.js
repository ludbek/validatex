import {validate, validateSingle} from "../src/index.js";
import {isNumber, isString, length, required, equalsTo} from "../src/validators.js";
import {expect} from "chai";



let isInvalid = () => {
	throw Error("{key}: invalid value {value}");
}

describe("validateSingle", () => {
	it("works with single validator.", () => {
		let error = validate(1, isNumber());
		expect(error).to.equal(undefined);

		error = validate("string", isNumber());
		expect(error).to.equal("'string' is not a valid number.");
	});

	it("works with multiple validators.", () => {
		let error = validate(9876543210, [isNumber(), length(10)]);
		expect(error).to.equal(undefined);


		error = validate(1, [isNumber(), length(10)]);
		expect(error).to.equal("It must be 10 characters long.");
	});

	it("returns single error by default.", () => {
		let error = validate("string", [isNumber(), length(10)]);
		expect(error).to.equal("'string' is not a valid number.");
	});

	it("returns multiple errors.", () => {
		let error = validate("string", [isNumber(), length(10)], true);
		expect(error).to.eql(["'string' is not a valid number.", "It must be 10 characters long."]);
	});

	it("returns empty error.", () => {
		let error = validate(9876543210, [isNumber(), length(10)], true);
		expect(error).to.eql([]);
	});

	it("short curcuits if one of the validator returns false.", () => {
		let error = validate("", [required(false), isNumber()]);
		expect(error).to.eql(undefined);
	});

	it("includes key and value to error template.", () => {
		let error = validateSingle("Lel", isInvalid, false, undefined, "name");
		expect(error).to.eql("name: invalid value Lel");
	});
});

describe("validate", () => {
	it("returns undefined if composite data is valid.", () => {
		let error = validate({planet: "earth"}, {planet: [isString()]});
		expect(error).to.not.exist;
	});


	it("validates non object data", () => {
		let error = validate("a", isNumber());
		expect(error).to.eql("'a' is not a valid number.");

		error = validate("string", [isNumber(), length(10)]);
		expect(error).to.eql("'string' is not a valid number.");

		error = validate(12, [isNumber(), length(10)]);
		expect(error).to.eql("It must be 10 characters long.");

		error = validate(1234567890, [isNumber(), length(10)]);
		expect(error).to.equal(undefined);
	});

	it("validates object data", () => {
		let schema = {
			"string": [isString(), length(2)],
			"number": [isNumber(), length(2)]
		};

		let data = {};
		let error = validate(data, schema);
		expect(error.string).to.eql("'undefined' is not a valid string.");
		expect(error.number).to.eql("'undefined' is not a valid number.");


		data = {string: "earth", number: 123};
		error = validate(data, schema);
		expect(error.string).to.eql("It must be 2 characters long.");
		expect(error.number).to.eql("It must be 2 characters long.");


		data = {string: "ab", number: 12};
		error = validate(data, schema);
		expect(error).to.not.exist;
	});

	it("returns multiple errors", () => {
		let schema = {
			"string": [isString(), length(2)],
			"number": [isNumber(), length(2)]
		};

		let data = {};
		let error = validate(data, schema, true);
		expect(error.string).to.eql(
				["'undefined' is not a valid string.", "It must be 2 characters long."]);
		expect(error.number).to.eql(
				["'undefined' is not a valid number.", "It must be 2 characters long."]);
	});

	it("passes entire data to validator as second arg", () => {
		let schema = {
			"password": [],
			"confirmPassword": equalsTo("password")
		};

		let data = {"password": "a", "confirmPassword": "b"};
		let error = validate(data, schema);
		expect(error.password).to.not.exist;
		expect(error.confirmPassword).to.eql("'confirmPassword' and 'password' do not match.");

		data.confirmPassword = "a";
		error = validate(data, schema);
		expect(error).to.not.exist;
	});

	it("sets error of a key in composite data to 'undefined' if its valid.", () => {
		let schema = {
			"password": required(true),
			"confirmPassword": equalsTo("password")
		};

		let data = {"password": "a", "confirmPassword": "b"};
		let error = validate(data, schema);
		expect(error.password).to.not.exist;
	});
});
