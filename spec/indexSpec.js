import {validate, validateSingle} from "../src/index.js";
import {isNumber, isString, hasLength, required, equalsTo} from "../src/validators.js";
import {expect} from "chai";



let isInvalid = () => {
	throw Error("{key}: invalid value {value}");
}

describe("validateSingle", () => {
	it("works with single validator.", () => {
		let error = validate(1, isNumber());
		expect(error).to.equal(undefined);

		error = validate("string", isNumber());
		expect(error).to.equal("It must be a number.");
	});

	it("works with multiple validators.", () => {
		let error = validate(9876543210, [isNumber(), hasLength(10)]);
		expect(error).to.equal(undefined);


		error = validate(1, [isNumber(), hasLength(10)]);
		expect(error).to.equal("It must be 10 digits long.");
	});

	it("returns single error by default.", () => {
		let error = validate("string", [isNumber(), hasLength(10)]);
		expect(error).to.equal("It must be a number.");
	});

	it("returns multiple errors.", () => {
		let error = validate("string", [isNumber(), hasLength(10)], true);
		expect(error).to.eql(["It must be a number.", "It must be 10 digits long."]);
	});

	it("returns empty error.", () => {
		let error = validate(9876543210, [isNumber(), hasLength(10)], true);
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
		expect(error).to.eql("It must be a number.");

		error = validate("string", [isNumber(), hasLength(10)]);
		expect(error).to.eql("It must be a number.");

		error = validate(12, [isNumber(), hasLength(10)]);
		expect(error).to.eql("It must be 10 digits long.");

		error = validate(1234567890, [isNumber(), hasLength(10)]);
		expect(error).to.equal(undefined);
	});

	it("validates object data", () => {
		let schema = {
			"string": [isString(), hasLength(2)],
			"number": [isNumber(), hasLength(2)]
		};

		let data = {};
		let error = validate(data, schema);
		expect(error.string).to.eql("It must be a string.");
		expect(error.number).to.eql("It must be a number.");


		data = {string: "earth", number: 123};
		error = validate(data, schema);
		expect(error.string).to.eql("It must be 2 digits long.");
		expect(error.number).to.eql("It must be 2 digits long.");


		data = {string: "ab", number: 12};
		error = validate(data, schema);
		expect(error).to.not.exist;
	});

	it("returns multiple errors", () => {
		let schema = {
			"string": [isString(), hasLength(2)],
			"number": [isNumber(), hasLength(2)]
		};

		let data = {};
		let error = validate(data, schema, true);
		expect(error.string).to.eql(["It must be a string.", "It must be 2 digits long."]);
		expect(error.number).to.eql(["It must be a number.", "It must be 2 digits long."]);
	});

	it("passes entire data to validator as second arg", () => {
		let schema = {
			"password": [],
			"confirmPassword": equalsTo("password")
		};

		let data = {"password": "a", "confirmPassword": "b"};
		let error = validate(data, schema);
		expect(error.password).to.not.exist;
		expect(error.confirmPassword).to.eql("Values are not equal.");

		data.confirmPassword = "a";
		error = validate(data, schema);
		expect(error).to.not.exist;
	});
});
