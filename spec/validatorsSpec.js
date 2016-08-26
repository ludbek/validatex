import {expect} from "chai";
import {required,
		isNumber,
		isString,
		equalsTo,
		isEmail,
		isArray,
		isObject,
		oneOf,
		noneOf,
		isFunction} from "../src/validators.js";


describe("required", () => {
	it("exists.", () => {
		expect(required).to.exist;
	});

	it("returns false if not required and  data is null.", () => {
		expect(required(false)()).to.equal(false);
		expect(required(false)("")).to.equal(false);
		expect(required(false)(null)).to.equal(false);
	});

	it("returns undefined if not required and data is not null", () => {
		expect(required(false)("adata")).to.not.exist;
	});

	it("raises exception if required and data is null ", () => {
		expect(required(true).bind(null)).to.throw(Error);
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
			expect(err.message).to.equal("'apple' is not equal to 'banana'.");
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

describe("oneOf", () => {
	it("exists", () => {
		expect(oneOf).to.exist;
	});

	it("throws exception if value does not fall under the given list.", () => {
		try {
			oneOf([1,3,5])(2);
		}
		catch (err) {
			expect(err.message).to.equal("'{value}' does not fall under the given list.");
		}
	});

	it("returns 'undefined' value falls under the given list.", () => {
		expect(oneOf([1,3,5])(3)).to.not.exist;
	});

	it("accepts custom error.", () => {
		try {
			oneOf([1,3,5], "Please pass an odd number.")(2);
		}
		catch (err) {
			expect(err.message).to.equal("Please pass an odd number.");
		}
	});
});

describe("noneOf", () => {
	it("exists", () => {
		expect(noneOf).to.exist;
	});

	it("throws exception if value falls under the given list.", () => {
		try {
			noneOf([1,3,5])(1);
		}
		catch (err) {
			expect(err.message).to.equal("'{value}' is not allowed.");
		}
	});

	it("returns 'undefined' value falls under the given list.", () => {
		expect(noneOf([1,3,5])(2)).to.not.exist;
	});

	it("accepts custom error.", () => {
		try {
			noneOf([1,3,5], "Odd numbers are not allowed.")(3);
		}
		catch (err) {
			expect(err.message).to.equal("Odd numbers are not allowed.");
		}
	});
});
