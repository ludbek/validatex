# Introduction
A simple yet powerful data validator for javascript.

## Features
- functions as validators
- supports both sync and async validators
- partial and strict validations for apis
- support for custom error message (e.g. i18n)

## Installation
### NPM
`npm install validatex`

## Quick walk through
```javascript
import {validate, avalidate, SkipValidation, minLength, required, equalsTo} from "validatex";

// custom validator
let isUsername = (value) => {
	if (!/^[a-z0-9]{4,}$/.test(value)) {
		return "Invalid username.";
	}
}

// define data schema
let signupSchema = {
	username: isUsername,
	password: [required(true), minLength(8)],
	confirmPassword: [required(true), equalsTo("password"), minLength(8)]
};


let data = {
	username: "123",
	password: "1234567",
	confirmPassword: "abcdefg"
};

// validate data against the schema
validate(data, signupSchema);
// =>
// { username: "Invalid username.",
//   password: "'password' must be at least 8 digits long.",
//   confirmPassword: "'confirmPassword' and 'password' do not match." }

// async validation
await avalidate(data, signupSchema)
// => [Promise]
```

## Sync validation
```
validate(data, schema, options?)
```

Default options
```
const defaultOptions = {
	multipleErrors: false,
	partial: false,
	strict: true,
	invalidKeyError: 'This field is not allowed.'
}
```

### Validate multiple errors
We can get multiple errors if we set `multipleErrors` to `true`.

```
const schema = {
	username: [isString(), minLength(6)]
}
const data = {
	username: 123
}
validate(data, schema, {multipleErrors: true})
// =>
//{
//  username: [
//    "'123' is not a valid string.",
//    'It must be at least 6 characters long.'
//  ]
//}
```

### Partial validation
Partial validation is useful for PATCH requests.

```
const schema = {
	firstName: required(true),
	lastName: required(true)
};

const data = {
	firstName: 'El'
};

validate(data, schema, { partial: true });
// => null
// It did not complain about 'lastName'

```

### Strict validation
In `strict` mode `validate` will complain about any keys that are outside the schema.

```
const schema = {
	firstName: required(true),
	lastName: required(true)
};

const data = {
	firstName: 'El',
	lastName: 'Ren',
	address: 'somewhere'
};

validate(data, schema, { strict: true });
// => { address: 'This field is not allowed.' }
```

## Async validation
`validatex` has async version of `validate` too, which is `avalidate`.
It has the same signature as that of `validate`. The only difference is it returns a Promise.

```
await avalidate(data, schema, options?)
```

## Validators
A validator is a normal function which must return error if data is invalid.  It must return `undefined` if data is valid.
Lets create a naive email validator.

```javascript
let isEmail = (value) => {
	if (!/.+@.+\..+/.test(value)) {
		return "Invalid email.";
	}
};

// invalid
validate("invalid@email", isEmail);
// => Invalid email.

// valid
validate("valid@email.com", isEmail);
// => null
```

### Composing a validator
A validator can be composed to tune its behavior. Below is how `minLength` validator is composed.

```javascript
// 'length' = length against which validation will be made
// 'error' = user supplied error message which will override the default error message
let minLength = (length, error) => {
	// return actual validator
	return (value) => {
		if (value.length < length) {
			return error || `It must be at least ${length} characters long.`;
		}
	};
};

validate("1234", minLength(5));
// => It must be at least 5 characters long.

validate("1234", minLength(5, "Its too short."));
// => Its too short.
```

### Short curcuit validation
A validator can throw `SkipValidation` to skip rest of the validation.
This is how `required` validator works.

```javascript
let required = (flag, error) => {
	return (value) => {
		if (flag && !value) {
			return error || "This field is required.";
		}
		else if (!flag && !value) {
			// skip rest of the validators
			// do not forget the new keyword
			throw new SkipValidation();
		}
	}
};

// invalid
validate("", [required(false), isNumber]);
// => null
```

### Validate against rest of the data
A validator gets entire data as 2nd argument so that one can validate against other data.
Validator `equalsTo` makes use of this feature to ensure a data matches with another data.

```javascript
let equalsTo = (key, error) => {
	// 'all' is entire data being validated
	return (value, all) => {
		if (value !== all[key]) {
			return error || `'{key}' and '${key}' do not match.`;
		}
	}
}; 

let schema = {
	password: required(true),
	confirmPassword: equalsTo("password")
};

let data = {
	password: "apassword",
	confirmPassword: "bpassword"
};

validate(data, schema);
// =>
// { password: null,
//   confirmPassword: "'confirmPassword' and 'password' do not match." }
```

`validatex` ships with some built in validators for convenience.

## Customize error
Depending upon the validators custom error can be passed as an extra argument.

```javascript
validate("", required(true, "This field cannot be blank."));
// => "This field cannot be blank."

// Error message can be templated to show the key and value.
let schema = {
	username: isString("Invalid value '{value}' for '{key}'.")
};

data = {
	username: 1
};

validate(data, schema);
// => { username: "Invalid value '1' for 'username'." }
```

## Internal API
```
validateSingle(data, validator/s, multipleErrors?, allData?, currentKey?)
```

Single piece of data can be validated against single or multiple validators with `validateSingle`. It is the low level function that is used by `validate` and `avalidate` functions. It can be used to create other powerful tools like [powerform](https://github.com/ludbek/powerform).

### With single validator
```javascript
validateSingle(1, isString());
// => '1' is not a valid string.

validateSingle("apple", isString());
// => null
```

### With multiple validators
```javascript
validateSingle("", [required(true), isNumber()]);
// => This field is required.
```

## Built in validators

### isBoolean
Checks if a value is a boolean.

```javascript
isBoolean(customError?)
```

### isNumber
Checks if a value is a number.

```javascript
isNumber(customError?)
```

### isString
Checks if a value is a string.

```javascript
isString(customError?)
```

### isFunction
Checks if a value is a function.

```javascript
isFunction(customError?)
```

### isObject
Checks if a value is an object.

```javascript
isObject(customError?)
```

### isArray
Checks if a value is an array.

```javascript
isArray(customError?)
```

### isEmail
Checks if a value is an email.

```javascript
isEmail()
```

### required
Checks if a value exists.

```javascript
required(true|false, customError?)
```
### equalsTo
Makes sure if a value matches another value.

```javascript
equalsTo(key, customError?)
```

### length
Checks lenght of a value.

```javascript
length(size, customError?)
```

### minLength
Checks if a value's length is within the minimum length.

```javascript
minLength(size, customError?)
```

### maxLength
Checks if a value's length is within the maximum length.

```javascript
maxLength(size, customError?)
```

### within
Checks if a value or list of values fall under a given list.

```javascript
within(list, customError?)
```

### excludes
Checks if a value or list of values do not fall under a given list.

```javascript
excludes(list, customError?)
```

### pattern
Checks if a value is in the given pattern.

```javascript
pattern(regex, customError?)
```

### Get multiple errors
Pass `true` as the 3rd argument to the `validate` function to get multiple errors.

```javascript
validate("", [required(true), isNumber()], true);
// => [ "This field is required.", "'' is not a valid number." ]

// returns empty list if data is valid
validate(1, [required(true), isNumber()], true);
// => []
```

## Syntax
```javascript
validate(data, schema, options?)
```

Default options
```javascript
{
	multipleErrors: false,
	partial: false,
	strict: true,
	invalidKeyError: 'This field is not allowed.'
}
```
