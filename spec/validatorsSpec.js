import {expect} from "chai";
import {required, isNumber, isString, equalsTo, isEmail, isFunction} from "../src/validators.js";


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
			expect(err.message).to.equal("A function is expected.");
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
