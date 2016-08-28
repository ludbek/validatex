# Introduction
A simple yet powerful data validator for javascript.

## Installation
### NPM
`npm install validatex`

### Bower
`bower install validatex`

## Quick walk through
```javascript
import {validate, ValidationError, minLength, required, equalsTo} from "validatex";

// custom validator
let isUsername = (value) => {
	if (!/^[a-z0-9]{4,}$/.test(value)) {
		throw new ValidationError("Invalid username.");
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
// output:
// { username: "Invalid username.",
//   password: "'password' must be at least 8 digits long.",
//   confirmPassword: "'confirmPassword' and 'password' do not match." }

// get multiple errors
validate(data, signupSchema, true);
// output:
// { username: [ "Invalid username." ],
//   password: [ "'password' must be at least 8 digits long." ],
//   confirmPassword: 
//    [ "'confirmPassword' and 'password' do not match.",
//      "'confirmPassword' must be at least 8 digits long." ] }
```

## Validate single data
Single piece of data can be validated against single or multiple validators

### With single validator
```javascript
validate(1, isString()); // '1' is not a valid string.

validate("apple", isString()); // undefined
```

### With multiple validators
```javascript
validate("", [required(true), isNumber()]); // This field is required.
```

### Get multiple errors
Pass `true` as the 3rd argument to the `validate` function to get multiple errors.

``javascript
validate("", [required(true), isNumber()], true); // [ "This field is required.", "'' is not a valid number." ]

// returns empty list if data is valid
validate(1, [required(true), isNumber()], true); // []
```

## Validate multiple data
Multiple data can be validated against single or multiple validators

```javascript
let loginSchema = {
	username: required(true),
	password: [required(true), minLength(8)]
};

let loginData = {
	username: "ausername",
	password: ""
};

validate(loginData, loginSchema); // { username: undefined, password: 'This field is required.' }
```

### Get multiple errors
Pass `true` as the 3rd argument to the `validate` function to get multiple errors.

```javascript
validate(loginData, loginSchema, true);
//output:
// { username: [],
//   password: 
//    [ "This field is required.",
//      "'password' must be at least 8 digits long."] }
```

## Customize error
Depending upon the validators custom error can be passed as an extra argument.

```javascript
validate("", required(true, "This field cannot be blank.")); // "This field cannot be blank."

// Error message can be templated to show the key and value.
let schema = {
	username: isString("Invalid value '{value}' for '{key}'.")
};
data = {
	username: 1
};

validate(data, schema); // { username: "Invalid value '1' for 'username'." }
```

## Custom validator
A validator is a normal function which must throw error if data is invalid.  It must return `undefined` if data is valid.
Lets create a naive email validator.

```javascript
let isEmail = (value) => {
	if (!/.+@.+\..+/.test(value)) {
		throw new ValidationError("Invalid email.");
	}
};

// invalid
validate("invalid@email", isEmail); // Invalid email.

// valid
validate("valid@email.com", isEmail); // undefined
```

### Composing a validator
A validator can be composed to tune its behavior. Below is how `minLength` validator is composed.

```javascript
// 'length' = length against which validation will be made
// 'error' = user suppoied error message which will override the default error message
let minLength = (length, error) => {
	// return actual validator
	return (value) => {
		if (value.length < length) {
			throw new ValidationError(error || `It must be at least ${length} characters long.`);
		}
	};
};

validate("1234", minLength(5)); // It must be at least 5 characters long.

validate("1234", minLength(5, "Its too short.")); // Its too short.
```

### Short curcuit validation
A validator can return `false` to skip rest of the validation. This is how `required` validator works.

```javascript
let required = (flag, error) => {
	return (value) => {
		if (flag && !value) {
			throw new ValidationError(error || "This field is required.");
		}
		else if (!flag && !value) {
			// skip rest of the validators
			return false;
		}
	}
};

// invalid
validate("", [required(false), isNumber]); // undefined
```

### Validate against rest of the data
A validator gets entire data as 2nd argument so that one can validate against other data.
Validator `equalsTo` makes use of this feature to ensure a data matches with another data.

```javascript
let equalsTo = (key, error) => {
	// 'all' is entire data being validated
	return (value, all) => {
		if (value !== all[key]) {
			throw new ValidationError(error || `'{key}' and '${key}' do not match.`);
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
// output:
// { password: undefined,
//   confirmPassword: "'confirmPassword' and 'password' do not match." }
```

## Validators

