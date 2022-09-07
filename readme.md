![](./media/ValidateX.png)
![](./media/made-with-typescript.svg)
![](https://img.shields.io/github/last-commit/ludbek/validatex?color=blue&style=flat-square) ![](https://img.shields.io/github/v/release/ludbek/validatex)

**A simple yet powerful JavaScript/TypeScript data validator.**

___
**Table of contents**

[TOC]
___

## [v1.x doc](https://github.com/ludbek/validatex/tree/v1.0.2)

## Migration from v1.x to v2.x
___

## Installation
This should be installed as one of your project dependencies :
```bash
  npm -i validatex
```
or
```bash
  yarn add validatex
```
___
## Usage
ValidateX aims on providing users with built-in decoders and validators to identify the type of the value and validate the value simultaneously. Along with the built-in decoders and validators, you can create custom decoders/validators.
___

## Key Features
- Functions as decoders/validators
- Supports Typescript
- Static type inference
- Easy to extend
- Easy to create custom decoders/validators

___

## Kitchen Sink
```typescript
import v, { Typeof } from 'validatex'

const userSchema = v.array(
  v.object({
    name: v.string(),
    mobile: v.toggle(v.number()),
    address: v.partial({
      postcode: v.number(),
      street1: v.string(),
      street2: v.toggle(v.string()),
    }),
  }),
);

type UserSchema = Typeof<typeof userSchema>
// Runtime type
//type UserSchema = {
//    mobile?: number | undefined;
//    name: string;
//    address: {
//        street2: string;
//        postcode?: number | undefined;
//        street1?: string | undefined;
//    };
//}[]

// if a valid data is given to the schema it returns it back
const value1 = [
  {
    name: 'foo',
    mobile: 1234567890,
    address: {
      postcode: 1,
      street1: 'street 1',
      street2: 'street 2',
    },
  },
];
expect(userSchema(value1)).toEqual(value1);

// if an invalid data is given to the schema it throws an error
const value2 = [
  {
    name: 'foo',
    mobile: 1234567890,
    address: {
      postcode: 1,
      street1: 'street 1',
      street2: 'street 2',
    },
  },
  {
    address: { street1: 'street 1' },
  },
];

// the root of the schema is an array, so is the root of the error
const expectedError = JSON.stringify([
  {
    "index":1,
    "error": {
      "name":"Expected string but got undefined.",
      "address": {
        "street2":"Expected string but got undefined."
      }
    }
  }
]);
expect(() => userSchema(userSchema, value2).toThrow(expectedError);
```
___

## Core concepts
#### Decoders
Decoder is a function that parses unkown value, validates it and returns a known value. A decoder has following signature.

```typescript
(val: unknown, context?: Context | undefined) => T
```
#### Context
```typescript
type Context = {
    key?: string | undefined;
    index?: number | undefined;
    schema?: any;
}
```

#### Compose complex decoder

#### Validators
Validator is a function that validates a known value as its name suggests . It returns an error if a value is invalid else returns nothing. A decoder uses 1 or many validators to validate a known value.

```typescript
(val: T, context?: Context | undefined) => string | Record<string, string> | undefined
```

#### Static type inference
```typescript
import v, { TypeOf } from 'validatex'

const loginSchema = v.object({
  username: v.string(),
  password: v.string()
})

type LoginSchema = TypeOf<typeof loginSchema>
// type LoginSchema = {
//     username: string;
//     password: string;
// }
```
___

## Built-In decoders
#### String
The **string** decoder parses unknown value, validates if its a string and returns an error or a string value on the basis of the validation.

The signature of string decoder looks like:
```typescript
(options?: DecoderOption<string>) => (val: any, context?: Context | undefined) => string
```

```typescript
const name = v.string()
```

##### Validate

```typescript
function alphaNumeric(val: string) {
  return /[a-zA-Z][\da-zA-Z]+/.test(val) ? undefined : 'Must be alpha numeric.';
}

const username = v.string(alphaNumeric);
expect(username('user1')).toEqual('user1');
// value validation
expect(() => username('123')).toThrow('Must be alpha numeric.');
```

##### Parse
```typescript
function parse(val: string) {
  if (typeof val === 'string' || typeof val === 'number') return `${val}`;
  return val;
}

const username = v.string(parse);

expect(username('user1')).toEqual('user1');
// parses value to string if its a number
expect(username(123)).toEqual('123');
```

##### Custom error message
```typescript
const customErrMsg = "This is a custom error message";

const username = v.string(customErrMsg);

expect(username.bind(username, 1)).toThrow(customErrorMsg);
```

#### Number
The **number** decoder takes an unknown value, validates if its a number and returns an error or a number depending on the outcome of the validation.
```typescript
(options?: DecoderOption<number>) => (val: any, context?: Context | undefined) => number
```

```typescript
const age = v.number();

expect(age(20)).toEqual(20);
// validation of value except number
expect(() => age("twenty")).toThrow('Expected number but got string.');
```
#### Boolean
The **boolean** decoder takes an unknown value, validates if its a boolean and returns an error or a number depending on the outcome of the validation.
```typescript
(options?: DecoderOption<boolean>) => (val: any, context?: Context | undefined) => boolean
```

```typescript
const married = v.boolean();

expect(married(true)).toEqual(true);
// validation of value except boolean
expect(() => married(1)).toThrow('Expected boolean but got number.');
```
#### Date
The **date** decoder takes an unknown value, validates if its a date object and returns an error or a Date depending on the outcome of the validation.
```typescript
(options?: DecoderOption<Date>) => (val: any, context?: Context | undefined) => Date
```
 If the unknown value is string, it parses the string to a date object. The decoder will return a date object only if the input is a valid date else return an error that says "Expected Date but got object."

```typescript
const dateOfBirth = v.date();

// Both the "/" or "-" symbols work well
expect(dateOfBirth(new Date("2001/04/05"))).toEqual(new Date("2001/04/05"));
// Parses string to a date object.
expect(dateOfBirth("2001-04-05")).toEqual(new Date("2001-04-05"));

// Invalid date validation
expect(() => dateOfBirth("2001-15-32")).toThrow("Expected Date but got object.");
// Validation of value except Date object and string
expect(() => dateOfBirth(2001)).toThrow("Expected Date but got number.");
```

#### Literal
The **literal** decoder parses an unknown value, validates if its value of type Premitive and returns an error or a Premitive value depending on the outcome of the validation. 

The type Premitive looks like :
```typescript
type Premitive = string | number | boolean | null | undefined;
```

**Signature of literal decoder**
```typescript
(options?: DecoderOption<Premitive>) => (val: any, context?: Context | undefined) => Premitive
```

```typescript
const apple = v.literal('apple');

expect(apple('apple')).toEqual('apple');
expect(() => apple('banana')).toThrow(`Expected 'apple', but got 'banana'.`);
```

#### object
```typescript
type Schema = Record<string, Decoder | Switch<any>>;
```

```typescript
(option?: ObjectOption<{ [K in keyof U]: U[K] }>) => (rawData: any, context?: Context) => Schema
```


```typescript
const userSchema = v.object({
  name: string(),
  address: string()
});

const val = { name: 'foo', address: 'bar' };
expect(userSchema(val)).toEqual(val);

const expectedError = JSON.stringify({
  name: 'Expected string but got undefined.',
  address: 'Expected string but got undefined.',
});
// invalid value
expect(() => userSchema({})).toThrow(expectedError);
// non-object validation
expect(userSchema.bind(userSchema, 1)).toThrow(expectedError)

//unknown field validation
const data = {
  username: 'a username',
  password: 'a password',
  unknownField1: 'unknown field 1',
  unknownField2: 'unknown field 2',
};
expect(userSchema.bind(userSchema, data)).toThrow(`{"unknownField1":"Unknown field.","unknownField2":"Unknown field."}`)
```

#### partial
#### array
#### enum
#### union

___

## In-build validators

#### minlength
The **minlength()** validates the minimum length of textual data. It takes two parameters, *size* and *customError*.
| Name | Type | Description |
| ----------- | ----------- | ----------- |
| *size* | number | It is the minimum length of textual data. It accepts a number. |
| *customError* | string | It is the customized error. If a customized error isn't passed into the validator then it return default error message. |

```typescript
minLength(size, customError?)
```

```typescript
// Invalid value
expect(minlength(5)("suku")).toEqual(`Should be at least 5 characters long`);
// Valid value
expect(minlength(5)("summit")).toEqual(undefined);

// Passing customError
const errorMsg = 'Custom error.';
expect(minlength(6, errorMsg)("suku")).toEqual(errorMsg);
```

#### maxlength
The **maxlength()** validates the minimum length of textual data. It takes two parameters, *size* and *customError*.
| Name | Type | Description |
| ----------- | ----------- | ----------- |
| *size* | number | It is the maximum length of textual data. It accepts a number. |

```typescript
maxLength(size, customError?)
```

```typescript
// Invalid value
expect(maxlength(3)("suku")).toEqual(`Should be no longer than ${len} characters`.);
// Valid value
expect(maxlength(6)("summit")).toEqual(undefined);

// Passing customError
const errorMsg = 'Custom error.';
expect(maxlength(3, errorMsg)("suku")).toEqual(errorMsg);
```

#### email
The **email** validator checks if a value is a valid email or not. It only takes *customError* as a parameter.

```typescript
maxLength(customError?)
```

```typescript
// Invalid value
expect(email()('aninvalid.email')).toEqual('The email is not valid');
// Valid value
expect(email()('someone@somewhere.com')).toEqual(undefined);

// Passing customError
const errorMsg = 'Custom error.';
expect(email(errorMsg)('aninvalid.email')).toEqual(errorMsg);
```

#### length
The **length** validator validates the exact length of the textual data. The two parameters of this validator are : *size* and *customError*.
| Name | Type | Description |
| ----------- | ----------- | ----------- |
| *size* | number | It represents the exact length of the textual data. |

```typescript
length(size, customError?)
```

```typescript
// Invalid value
const expectedError = `Should be 5 characters long`;
expect(length(5)('1234')).toEqual(expectedError);expect(length(5)('1234')).toEqual(expectedError);
// Valid value
expect(length(1)('1')).toEqual(undefined);

// Passing customError
const errorMsg = 'Custom error.';
expect(length(5, errorMsg)('1')).toEqual(errorMsg);
```

#### pattern
The **pattern** validator checks if a value matches a specific pattern. It takes two parameters: *regex* and *customError*.
| Name | Type | Description |
| ----------- | ----------- | ----------- |
| *regex* | regular expression | A pattern that entered data needs to follow. |
```typescript
pattern(regex, customError?)
```

```typescript
// Invalid value
expect(pattern(/^[a-b]/)('z')).toEqual(`The value 'z' doen't match the pattern /^[a-b]/`);
// Valid value
expect(pattern(/^[a-z0-9]*$/)('12ba')).toEqual(undefined);

// Passing customError
const errorMsg = 'Custom error.';
expect(pattern(/^[a-z0-9]*$/, errorMsg)('abc_123')).toEqual(errorMsg);
```

#### min
The **min** validator checks whether a value is greater than the minimum value specified. The two parameters of the validators are: *number* and *customError*.
| Name | Type | Description |
| ----------- | ----------- | ----------- |
| *number* | number | Minimum value that entered data needs to be greater than. |
```typescript
min(number, customError?)
```

```typescript
// Invalid value
expect(min(15)(12)).toEqual(`Value 12 should be greater than 15`);
// Valid value
expect(min(15)(17)).toEqual(undefined);

// Passing customError
const errorMsg = 'Custom error.';
expect(min(6, errorMsg)(5)).toEqual(errorMsg);
```

#### max
The **max** validator checks whether a value is smaller than the maximum value specified. The two parameters of the validators are: *number* and *customError*.
| Name | Type | Description |
| ----------- | ----------- | ----------- |
| *number* | number | Maximum value that entered data needs to be smaller than. |

```typescript
max(number, customError?)
```

```typescript
// Invalid value
expect(max(12)(15)).toEqual(`Value 15 should be smaller than 12`);
// Valid value
expect(max(6)(4)).toEqual(undefined);

// Passing customError
const errorMsg = 'Custom error.';
expect(max(3, errorMsg)(5)).toEqual(errorMsg);
```

#### minDate
The **minDate** validator set the minimum date and checks whether the entered date comes after the minimum date. It takes two parameters: *date* and *customError*.
| Name | Type | Description |
| ----------- | ----------- | ----------- |
| *date* | date object | Minimum date that can be entered. |

```typescript
minDate(date, customError?)
```
```typescript
// Invalid value
const expectedError = `The entered date must come after Mon Apr 05 2021`;
expect(minDate(new Date("2021/4/5"))(new Date("2021/3/4"))).toEqual(expectedError);
// Valid value
expect(minDate(new Date("2021/4/5"))(new Date("2021/4/6"))).toEqual(undefined);

// Passing customError
const errorMsg = `The date entered doesn't exist.`;
expect(minDate(new Date("2021/4/5"), errorMsg)(new Date("2020/4/6"))).toEqual(errorMsg);
```

#### maxDate
The **maxDate** validator set the maximum date and checks whether the entered date comes before the maximum date. It takes two parameters: *date* and *customError*.
| Name | Type | Description |
| ----------- | ----------- | ----------- |
| *date* | date object | Maximum date that can be entered. |
```typescript
maxDate(date, customError?)
```

```typescript
// Invalid value
const expectedError = `The entered date must come before Mon Apr 05 2021`;
expect(maxDate(new Date("2021/4/5"))(new Date("2021/6/4"))).toEqual(expectedError);
// Valid value
expect(maxDate(new Date("2021/4/5"))(new Date("2020/5/6"))).toEqual(undefined);

// Passing customError
const errorMsg = `The date entered doesn't exist.`;
expect(maxDate(new Date("2021/4/5"), errorMsg)(new Date("2022/4/6"))).toEqual(errorMsg);
```
