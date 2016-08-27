# Introduction
`validatex` is a simple, yet flexible validator.

## Installation
### NPM
`npm install validatex`

### BOWER
`bower install validatex`

## Preview
```javascript
import {validate} from "validatex";
import {required, equals} from "validatex-validators";

// show custom validator
// show single validator works
// show multiple validators works
// what happens if there is error
// what happens if there is no error

let signupSchema = {
	username: required(true),
	password: [required(true), hasLength(8)],
	confirmPassword: [required(true), equals("password")]
};

let data = {
	username: "",
	password: "apassword",
	confirmPassword: "bpassword"
};

validate(data, signupSchema);

{
	username: "This field is required.",
	password: undefined,
	confirmPassword: "'password' and 'confirmPassword' do not match."
}
```

## API
### Validate single data
### Validate multiple data
### Get multiple errors
### Built in validators
### Customer validator
### Short curcuit validation
### Get entire data in a validator


