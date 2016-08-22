import {validate} from "../src/index.js";
import {expect} from "chai";


let isNumber = (data) => {
	if (typeof data !== "number") {
		throw Error("It must be a number.");
	}
};

let isLength = (length) => {
	return (data) => {
		let str = data + "";
		if (str.length !== length) {
			throw Error(`It must be ${length} digits long.`);
		}
	};
};

let required = (flag) => {
	return (data) => {
		if (flag && !data) {
			throw Error("It is required.");
		}
		// skip rest of the validators
		return false;
	}
}

describe("validate", () => {
	it("works with single validator.", () => {
		let error = validate(1, isNumber);
		expect(error).to.equal(undefined);

		error = validate("string", isNumber);
		expect(error).to.equal("It must be a number.");
	});

	it("works with multiple validators.", () => {
		let error = validate(9876543210, [isNumber, isLength(10)]);
		expect(error).to.equal(undefined);


		error = validate(1, [isNumber, isLength(10)]);
		expect(error).to.equal("It must be 10 digits long.");
	});

	it("returns single error by default.", () => {
		let error = validate("string", [isNumber, isLength(10)]);
		expect(error).to.equal("It must be a number.");
	});

	it("returns multiple errors.", () => {
		let error = validate("string", [isNumber, isLength(10)], true);
		expect(error).to.eql(["It must be a number.", "It must be 10 digits long."]);
	});

	it("returns empty error.", () => {
		let error = validate(9876543210, [isNumber, isLength(10)], true);
		expect(error).to.eql([]);
	});

	it("short curcuits if one of the validator returns false.", () => {
		let error = validate("string", [required(false), isNumber]);
		expect(error).to.eql(undefined);
	});
});
