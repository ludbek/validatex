import {
	validate,
	validateSingle,
	avalidateSingle,
	avalidate,
	SkipValidation,
	required,
	isNumber,
	isString,
	equalsTo,
	isEmail,
	isArray,
	isObject,
	oneOf,
	noneOf,
	length,
	minLength,
	maxLength,
	isBoolean,
	within,
	excludes,
	pattern,
	isFunction
} from "../src/index.js";
import {expect} from "chai";


let isInvalid = () => {
	return "{key}: invalid value {value}";
}

describe('avalidateSingle', () => {
	it('works with async validator', async () => {
		async function validator () { return 'The value should not be 1' }
		const error = await avalidateSingle(1, validator);
		expect(error).to.equal('The value should not be 1');
	})

	it('works with multiple async validators', async () => {
		async function pass() {}
		async function fail() {return 'Bazinga !!!'}
		const error = await avalidateSingle(1, [pass, fail])
		expect(error).to.eql('Bazinga !!!')
	})

	it('works with async and sync validators', async () => {
		async function pass() {}
		function fail() {return 'Bazinga !!!'}
		const error = await avalidateSingle(1, [pass, fail])
		expect(error).to.eql('Bazinga !!!')
	})

	it("works with single validator.", async () => {
		let error = await avalidateSingle(1, isNumber());
		expect(error).to.equal(null);

		error = await avalidateSingle("string", isNumber());
		expect(error).to.equal("'string' is not a valid number.");
	});

	it("works with multiple validators.", async () => {
		let error = await avalidateSingle(9876543210, [isNumber(), length(10)]);
		expect(error).to.equal(null);


		error = await avalidateSingle(1, [isNumber(), length(10)]);
		expect(error).to.equal("It must be 10 characters long.");
	});

	it("returns single error by default.", async () => {
		const error = await avalidateSingle("string", [isNumber(), length(10)]);
		expect(error).to.equal("'string' is not a valid number.");
	});

	it("returns multiple errors.", async () => {
		const error = await avalidateSingle("string", [isNumber(), length(10)], true);
		expect(error).to.eql(["'string' is not a valid number.", "It must be 10 characters long."]);
	});

	it("returns null even when multiple validators are present", async () => {
		const error = await avalidateSingle(9876543210, [isNumber(), length(10)], true);
		expect(error).to.eql(null);
	});

	it("short curcuits if one of the validator returns false.", async  () => {
		const error = await avalidateSingle("", [required(false), isNumber()]);
		expect(error).to.eql(null);
	});

	it("includes key and value to error template.", async () => {
		const error = await avalidateSingle("Lel", isInvalid, false, undefined, "name");
		expect(error).to.eql("name: invalid value Lel");
	});
})

describe("avalidate", () => {
	it("complains if unknown fields are passed in strict mode", async () => {
		const data = {fieldA: 1, fieldB: 2, fieldC: 3}
		const schema = {fieldC: required(true)}
		const error = await avalidate(data, schema)
		expect(error).to.eql({
			fieldA: 'This field is not allowed.',
			fieldB: 'This field is not allowed.',
		})
	})

	it("wont complain if unknown fields are passed in non strict mode", async () => {
		const data = {fieldA: 1, fieldB: 2, fieldC: 3}
		const schema = {fieldC: required(true)}
		const error = await avalidate(data, schema, {strict: false})
		expect(error).to.eql(null)
	})

	it('supports partial mode', async () => {
		const data = {fieldA: 1}
		const schema = {
			fieldA: required(true),
			fieldB: required(true)
		}
		const error = await avalidate(data, schema, { partial: true })
		expect(error).to.eql(null)
	})

	it('works with async validators', async () => {
		async function fail() {return 'Bazinga !!!'}
		async function pass() {}
		const data = {fieldB: 'a data'}
		const schema = {fieldA: [pass, fail], fieldB: [required(true), pass]}
		const errors = await avalidate(data, schema)
		expect(errors).to.eql({
			fieldA: 'Bazinga !!!'
		})
	})

	it("returns null if valid.", async () => {
		const error = await avalidate({planet: "earth"}, {planet: [isString()]});
		expect(error).to.eql(null)
	});

	it("validates object data", async () => {
		let schema = {
			"string": [isString(), length(2)],
			"number": [isNumber(), length(2)]
		};

		let data = {};
		let error = await avalidate(data, schema);
		expect(error.string).to.eql("'undefined' is not a valid string.");
		expect(error.number).to.eql("'undefined' is not a valid number.");


		data = {string: "earth", number: 123};
		error = await avalidate(data, schema);
		expect(error.string).to.eql("It must be 2 characters long.");
		expect(error.number).to.eql("It must be 2 characters long.");


		data = {string: "ab", number: 12};
		error = await avalidate(data, schema);
		expect(error).to.not.exist;
	});

	it("returns multiple errors", async () => {
		const schema = {
			"string": [isString(), length(2)],
			"number": [isNumber(), length(2)]
		};

		const data = {};
		const error = await avalidate(data, schema, {multipleErrors: true});
		expect(error.string).to.eql([
			"'undefined' is not a valid string.",
			"It must be 2 characters long."
		]);
		expect(error.number).to.eql([
			"'undefined' is not a valid number.",
			"It must be 2 characters long."
		]);
	});

	it("passes entire data to validator as second arg", async () => {
		let schema = {
			"password": [],
			"confirmPassword": equalsTo("password")
		};

		let data = {"password": "a", "confirmPassword": "b"};
		let error = await avalidate(data, schema);
		expect(error.password).to.not.exist;
		expect(error.confirmPassword).to.eql("'confirmPassword' and 'password' do not match.");

		data.confirmPassword = "a";
		error = await avalidate(data, schema);
		expect(error).to.not.exist;
	});

	it("sets error of a key in composite data to 'undefined' if its valid.", async () => {
		const schema = {
			"password": required(true),
			"confirmPassword": equalsTo("password")
		};

		const data = {"password": "a", "confirmPassword": "b"};
		const error = await avalidate(data, schema);
		expect(error.password).to.not.exist;
	});
});

describe("validateSingle", () => {
	it("works with single validator.", () => {
		let error = validateSingle(1, isNumber());
		expect(error).to.equal(null);

		error = validateSingle("string", isNumber());
		expect(error).to.equal("'string' is not a valid number.");
	});

	it("works with multiple validators.", () => {
		let error = validateSingle(9876543210, [isNumber(), length(10)]);
		expect(error).to.equal(null);


		error = validateSingle(1, [isNumber(), length(10)]);
		expect(error).to.equal("It must be 10 characters long.");
	});

	it("returns single error by default.", () => {
		let error = validateSingle("string", [isNumber(), length(10)]);
		expect(error).to.equal("'string' is not a valid number.");
	});

	it("returns multiple errors.", () => {
		let error = validateSingle("string", [isNumber(), length(10)], true);
		expect(error).to.eql(["'string' is not a valid number.", "It must be 10 characters long."]);
	});

	it("returns empty error.", () => {
		let error = validateSingle(9876543210, [isNumber(), length(10)], true);
		expect(error).to.eql(null);
	});

	it("short curcuits if one of the validator returns false.", () => {
		let error = validateSingle("", [required(false), isNumber()]);
		expect(error).to.eql(null);
	});

	it("includes key and value to error template.", () => {
		let error = validateSingle("Lel", isInvalid, false, undefined, "name");
		expect(error).to.eql("name: invalid value Lel");
	});
});

describe("validate", () => {
	it("complains if unknown fields are passed in strict mode", async () => {
		const data = {fieldA: 1, fieldB: 2, fieldC: 3}
		const schema = {fieldC: required(true)}
		const error = await avalidate(data, schema)
		expect(error).to.eql({
			fieldA: 'This field is not allowed.',
			fieldB: 'This field is not allowed.',
		})
	})

	it("wont complain if unknown fields are passed in non strict mode", async () => {
		const data = {fieldA: 1, fieldB: 2, fieldC: 3}
		const schema = {fieldC: required(true)}
		const error = await avalidate(data, schema, {strict: false})
		expect(error).to.eql(null)
	})

	it('supports partial mode', async () => {
		const data = {fieldA: 1}
		const schema = {
			fieldA: required(true),
			fieldB: required(true)
		}
		const error = await avalidate(data, schema, { partial: true })
		expect(error).to.eql(null)
	})

	it("returns undefined if composite data is valid.", () => {
		let error = validate({planet: "earth"}, {planet: [isString()]});
		expect(error).to.not.exist;
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
		let error = validate(data, schema, {multipleErrors: true});
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

describe("required", () => {
	it("exists.", () => {
		expect(required).to.exist;
	});

	it("throws SkipValidation exception if not required and  data is null.", () => {
		expect(required(false).bind(null)).to.throw(SkipValidation);
		expect(required(false).bind(null, "")).to.throw(SkipValidation);
		expect(required(false).bind(null, null)).to.throw(SkipValidation);
	});

	it("returns undefined if not required and data is not null", () => {
		expect(required(false)("adata")).to.not.exist;
	});

	it("returns error if required and data is null ", () => {
		expect(required(true)(null)).to.equal("This field is required.");
	});

	it("returns undefined if required and data is not null", () => {
		expect(required(true)("adata")).to.not.exist;
	});

	it("returns custom error", () => {
		try {
			required(true, "Custom Error").bind(null)
		}
		catch (err) {
			expect(err.msg).to.equal("Custom Error");
		}
	});
});

describe("isNumber", () => {
	it("exists", () => {
		expect(isNumber).to.exist;
	});

	it("raises exception if value is not a number", () => {
		try {
			isNumber()("a");
		}
		catch (err) {
			expect(err.message).to.equal("'{value}' is not a valid number.");
		}
	});

	it("returns nth if value is a number", () => {
		expect(isNumber()(1)).to.not.exist;
	});

	it("raises exception for NaN", () => {
		try {
			isNumber()(NaN);
		}
		catch (err) {
			expect(err.message).to.equal("'{value}' is not a valid number.");
		}
	});

	it("accepts custom error", () => {
		try {
			isNumber("jpt")("a");
		}
		catch (err) {
			expect(err.message).to.equal("jpt");
		}
	});
});

describe("isString", () => {
	it("exists", () => {
		expect(isString).to.exist;
	});

	it("raises exception for non string", () => {
		try {
			isString()(0);
		}
		catch (err) {
			expect(err.message).to.equal("'{value}' is not a valid string.");
		}
	});

	it("returns 'undefined' for string", () => {
		expect(isString()("string")).to.not.exist;
	});

	it("accepts custom error", () => {
		try {
			isString("a")(0);
		}
		catch (err) {
			expect(err.message).to.equal("a");
		}
	});
});


describe("equalsTo", () => {
	it("exists", () => {
		expect(equalsTo).to.exist;
	});

	it("raises exception if values are not equal.", () => {
		try {
			equalsTo("password")("apple", {password: "banana"});
		}
		catch (err) {
			expect(err.message).to.equal("'{key}' and 'password' do not match.");
		}
	});

	it("returns undefined if values are equal", () => {
		expect(equalsTo("password")("banana", {password: "banana"})).to.not.exist;
	});

	it("accepts custom error", () => {
		try {
			equalsTo("password", "a error")("apple", {password: "banana"});
		}
		catch (err) {
			expect(err.message).to.equal("a error");
		}
	});
});


describe("isEmail", () => {
	it("exists.", () => {
		expect(isEmail).to.exist;
	});

	it("throws exception for invalid email.", () => {
		try {
			isEmail()("foo")
		}
		catch (err) {
			expect(err.message).to.equal("Invalid email id.");
		}
	});

	it("returns undefined for valid email.", () => {
		expect(isEmail()("foo@fooland.com")).to.equal(undefined);
	});

	it("accepts custom error.", () => {
		try {
			isEmail("a error")("foo")
		}
		catch (err) {
			expect(err.message).to.equal("a error");
		}
	});
});

describe("isFunction", () => {
	it("exists", () => {
		expect(isFunction).to.exist;
	});

	it("throws exception if function is not supplied.", () => {
		try {
			isFunction()("not a function");
		}
		catch (err) {
			expect(err.message).to.equal("Expected a function.");
		}
	});

	it("returns 'undefined' if function is supplied.", () => {
		let aFunc = () => {};
		expect(isFunction()(aFunc)).to.not.exist;
	});

	it("accepts custom error.", () => {
		try {
			isFunction("Please pass a function.")("not a function");
		}
		catch (err) {
			expect(err.message).to.equal("Please pass a function.");
		}
	});
});

describe("isObject", () => {
	it("exists", () => {
		expect(isObject).to.exist;
	});

	it("throws exception if function is not supplied.", () => {
		try {
			isObject()("not an object");
		}
		catch (err) {
			expect(err.message).to.equal("Expected an object.");
		}
	});

	it("returns 'undefined' if function is supplied.", () => {
		let aObj = {};
		expect(isObject()(aObj)).to.not.exist;
	});

	it("accepts custom error.", () => {
		try {
			isObject("Please pass an object.")("not an object");
		}
		catch (err) {
			expect(err.message).to.equal("Please pass an object.");
		}
	});
});

describe("isArray", () => {
	it("exists", () => {
		expect(isArray).to.exist;
	});

	it("throws exception if function is not supplied.", () => {
		try {
			isArray()("not an array");
		}
		catch (err) {
			expect(err.message).to.equal("Expected an array.");
		}
	});

	it("returns 'undefined' if function is supplied.", () => {
		expect(isArray()([])).to.not.exist;
	});

	it("accepts custom error.", () => {
		try {
			isArray("Please pass an array.")("not an array");
		}
		catch (err) {
			expect(err.message).to.equal("Please pass an array.");
		}
	});
});

describe("length", () => {
	it("exists", () => {
		expect(length).to.exist;
	});

	it("throws exception if data is of wrong length.", () => {
		try {
			length(5)("123");
		}
		catch (err) {
			expect(err.message).to.equal("It must be 5 characters long.");
		}
	});

	it("returns 'undefined' if data is of right lenght.", () => {
		expect(length(5)("12345")).to.not.exist;
	});

	it("accepts custom error.", () => {
		try {
			length(5, "Data is of wrong length.")("1");
		}
		catch (err) {
			expect(err.message).to.equal("Data is of wrong length.");
		}
	});
});

describe("minLength", () => {
	it("exists", () => {
		expect(minLength).to.exist;
	});

	it("throws exception if data is of wrong length.", () => {
		try {
			minLength(5)("1234");
		}
		catch (err) {
			expect(err.message).to.equal("It must be at least 5 characters long.");
		}
	});

	it("returns 'undefined' if data is of right lenght.", () => {
		expect(minLength(5)("12345")).to.not.exist;
		expect(minLength(5)("123456")).to.not.exist;
	});

	it("accepts custom error.", () => {
		try {
			minLength(5, "Data is of wrong length.")("1");
		}
		catch (err) {
			expect(err.message).to.equal("Data is of wrong length.");
		}
	});
});

describe("maxLength", () => {
	it("exists", () => {
		expect(maxLength).to.exist;
	});

	it("throws exception if data is of wrong length.", () => {
		try {
			maxLength(5)("123456");
		}
		catch (err) {
			expect(err.message).to.equal("It must be at most 5 characters long.");
		}
	});

	it("returns 'undefined' if data is of right lenght.", () => {
		expect(maxLength(5)("12345")).to.not.exist;
		expect(maxLength(5)("1234")).to.not.exist;
	});

	it("accepts custom error.", () => {
		try {
			maxLength(5, "Data is of wrong length.")("123456");
		}
		catch (err) {
			expect(err.message).to.equal("Data is of wrong length.");
		}
	});
});

describe("isBoolean", () => {
	it("exists", () => {
		expect(isBoolean).to.exist;
	});

	it("throws exception if data is of wrong length.", () => {
		try {
			isBoolean()("true");
		}
		catch (err) {
			expect(err.message).to.equal("Invalid boolean value.");
		}
	});

	it("returns 'undefined' if data is a boolean.", () => {
		expect(isBoolean()(true)).to.not.exist;
		expect(isBoolean()(false)).to.not.exist;
	});

	it("accepts custom error.", () => {
		try {
			isBoolean("Not a boolean.")("false");
		}
		catch (err) {
			expect(err.message).to.equal("Not a boolean.");
		}
	});
});

describe("within", () => {
	it("works with single item.", () => {
		let got = validateSingle(1, within([1,2]));
		expect(got).to.not.exist;

		got = validateSingle(3, within([1,2]));
		expect(got).to.equal("[3] do not fall under the allowed list.");
	});

	it("works with multiple items.", () => {
		let got = validateSingle([2,3], within([1,2,3]));
		expect(got).to.not.exist;

		got = validateSingle([2,4,5], within([1,2,3]));
		expect(got).to.equal("[4,5] do not fall under the allowed list.");
	});

	it("accepts custom error.", () => {
		let got = validateSingle([1,4,5], within([1,2,3], "Invalid values."));
		expect(got).to.equal("Invalid values.");
	});
});

describe("excludes", () => {
	it("works with single item.", () => {
		let got = validateSingle(3, excludes([1,2]));
		expect(got).to.not.exist;

		got = validateSingle(1, excludes([1,2]));
		expect(got).to.equal("[1] fall under restricted values.");
	});

	it("works with multiple items.", () => {
		let got = validateSingle([4,5], excludes([1,2,3]));
		expect(got).to.not.exist;

		got = validateSingle([2,3,5], excludes([1,2,3]));
		expect(got).to.equal("[2,3] fall under restricted values.");
	});

	it("accepts custom error.", () => {
		let got = validateSingle(3, excludes([1,2,3], "Invalid values."));
		expect(got).to.equal("Invalid values.");
	});
});

describe("pattern", () => {
	it("exists", () => {
		expect(pattern).to.exist;
	});

	it("throws if data do not match the pattern.", () => {
		try {
			pattern(/\d{2}/)("1");
		}
		catch (err) {
			expect(err.message).to.equal("'{value}' does not match with the pattern.");
		}
	});

	it("return undefined if data match the pattern.", () => {
		expect(pattern(/\d{2}/)("11")).to.not.exist;
	});

	it("accepts custom error.", () => {
		try {
			pattern(/\d{2}/, "Invalid data.")("1");
		}
		catch (err) {
			expect(err.message).to.equal("Invalid data.");
		}
	});
});
