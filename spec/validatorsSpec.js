import {expect} from "chai";
import {required, isNumber} from "../src/validators.js";


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
