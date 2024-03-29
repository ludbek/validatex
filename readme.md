![](./media/ValidateX.png)
![](./media/made-with-typescript.svg)
![](https://img.shields.io/github/last-commit/ludbek/validatex?color=blue&style=flat-square) ![](https://img.shields.io/github/v/release/ludbek/validatex)

**A simple yet powerful JavaScript/TypeScript data validator.**
___
**Table of Contents**

* [v1.x doc](#v1x-dochttpsgithubcomludbekvalidatextreev102)
* [Migration from v1.x to v2.x](#migration-from-v1x-to-v2x)
* [Installation](#installation)
* [Usage](#usage)
* [Key Features](#key-features)
* [Kitchen Sink](#kitchen-sink)
* [Core concepts](#core-concepts)
  * [Decoder](#decoder)
    * [Without any option](#without-any-option)
    * [With DecoderFullOptions](#with-decoderfulloptions)
  * [Validator](#validator)
  * [Static type inference](#static-type-inference)
* [Decoders](#decoders)
  * [String](#string)
    * [DecoderOption](#decoderoption)
    * [Validate](#validate)
    * [Custom error message](#custom-error-message)
    * [Validators for String](#validators-for-string)
      * [minlength](#minlength)
      * [maxlength](#maxlength)
      * [email](#email)
      * [length](#length)
      * [pattern](#pattern)
    * [Number](#number)
      * [Validators for Number](#validators-for-number)
        * [min](#min)
        * [max](#max)
    * [Boolean](#boolean)
      * [Validators for Boolean](#validators-for-boolean)
        * [isTrue](#istrue)
        * [isFalse](#isfalse)
    * [Date](#date)
      * [Validators for Date](#validators-for-date)
        * [minDate](#mindate)
        * [maxDate](#maxdate)
  * [Literal](#literal)
  * [Object](#object)
  * [Partial](#partial)
  * [Array](#array)
  * [Enum](#enum)
  * [Union](#union)
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
ValidateX aims on providing users with decoders and validators to identify the type of the value and validate the value simultaneously. Along with the decoders and validators that validatex provides, you can create custom decoders/validators.
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
    name: v.string(v.minlenth(1)),
    mobile: v.toggle(v.number(v.max(9999999999))),
    address: v.partial({
      postcode: v.number(),
      street1: v.string(v.minlenth(1)),
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
#### Decoder
Decoder is a function that parses unkown value, validates it and returns a known value. A decoder has the following signature.

```typescript
(val: unknown, context?: Context | undefined) => T
```

[//]: <> (Context should be documented here.)
**Context**

```typescript
type Context = {
  key?: string | undefined;
  raw?: Record<string, any>;
  index?: number | undefined;
  schema?: any;
}
```

##### Without any option
```typescript
const defaultErrorMsg = 'Not a string';
const str = decoder<string, unknown>({
  typeGuard: (val: unknown): val is string => typeof val === 'string',
  getDefaultErrorMsg: () => defaultErrorMsg,
  defaultParser: identity,
});

const nameSchema = str();
expect(nameSchema('foo')).toEqual('foo');
expect(nameSchema.bind(nameSchema, 1)).toThrow(defaultErrorMsg);
```

##### With DecoderFullOptions
```typescript
const defaultErrorMsg = 'Not a string';
const customErrorMsg = 'It should be a string.';
const customValidationErrorMsg = "must not contain '-'.";
const str = decoder<string, unknown>({
  typeGuard: (val: unknown): val is string => typeof val === 'string',
  getDefaultErrorMsg: () => defaultErrorMsg,
  defaultParser: identity,
});
const alphaNumSchema = str({
  parse(val) {
    if (typeof val === 'string' || typeof val === 'number') return `${val}`;
    return val;
  },
  validate(val, { key } = { key: undefined }) {
    if (val.includes('-')) return `${key} ${customValidationErrorMsg}`;
  },
  errorMsg: customErrorMsg,
});
expect(alphaNumSchema('valid string')).toEqual('valid string');
// it parses
expect(alphaNumSchema(1)).toEqual('1');
// it respects custom error msg
expect(alphaNumSchema.bind(alphaNumSchema, true)).toThrow(customErrorMsg);
// it respects custom validator
expect(
  alphaNumSchema.bind(alphaNumSchema, 'hello-there', { key: 'akey' }),
).toThrow(customValidationErrorMsg);

// it respects getErrorMsg
const schema = str({
  getErrorMsg: (val, { key } = { key: undefined }) => {
    return `${key} must not be ${val}`;
  },
});
expect(schema.bind(schema, 1, { key: 'akey' })).toThrow(
  'akey must not be 1',
);

// it accepts an array of validators
const schemaB = str({ validate: [isSingleWord, max5] });
expect(schemaB.bind(schemaB, 'kathmandu')).toThrow(maxError);
expect(schemaB.bind(schemaB, 'new road')).toThrow(singleWordError);
expect(schemaB('abc')).toEqual('abc');
```

[//]: <> (Compose complex decoders should be documented here.)

#### Validator
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

##  Decoders
### String
The **string** decoder parses unknown value, validates it and returns an error or a string value on the basis of the validation.

The signature of string decoder looks like:
```typescript
(options?: DecoderOption<string>) => (val: unknown, context?: Context | undefined) => string
```
```typescript
const name = v.string()
```

##### DecoderOption
```typescript
type DecoderOption<T> =
  | Validator<T>
  | Validator<T>[]
  | CustomErrorMsg
  | DecoderFullOption<T>;
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

##### Custom error message
```typescript
const customErrMsg = "This is a custom error message";

const username = v.string(customErrMsg);

expect(username.bind(username, 1)).toThrow(customErrorMsg);
```

#### Validators for String

##### minlength
The **minlength()** validates the minimum length of textual data. It takes two parameters, *size* and *customError*.

```typescript
minLength(size, customError?)
```

| Name | Type | Description |
| ----------- | ----------- | ----------- |
| *size* | number | It is the minimum length of textual data. It accepts a number. |
| *customError* | string | It is the customized error. If a customized error isn't passed into the validator then it returns default error message. |



```typescript
// Invalid value
expect(minlength(5)("suku")).toEqual(`Should be at least 5 characters long`);
// Valid value
expect(minlength(5)("summit")).toEqual(undefined);

// Passing customError
const errorMsg = 'Custom error.';
expect(minlength(6, errorMsg)("suku")).toEqual(errorMsg);
```

##### maxlength
The **maxlength()** validates the minimum length of textual data. It takes two parameters, *size* and *customError*.

```typescript
maxLength(size, customError?)
```

| Name | Type | Description |
| ----------- | ----------- | ----------- |
| *size* | number | It is the maximum length of textual data. It accepts a number. |



```typescript
// Invalid value
expect(maxlength(3)("suku")).toEqual(`Should be no longer than ${len} characters`.);
// Valid value
expect(maxlength(6)("summit")).toEqual(undefined);

// Passing customError
const errorMsg = 'Custom error.';
expect(maxlength(3, errorMsg)("suku")).toEqual(errorMsg);
```

##### email
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

##### length
The **length** validator validates the exact length of the textual data. The two parameters of this validator are : *size* and *customError*.

```typescript
length(size, customError?)
```

| Name | Type | Description |
| ----------- | ----------- | ----------- |
| *size* | number | It represents the exact length of the textual data. |


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

##### pattern
The **pattern** validator checks if a value matches a specific pattern. It takes two parameters: *regex* and *customError*.
```typescript
pattern(regex, customError?)
```

| Name | Type | Description |
| ----------- | ----------- | ----------- |
| *regex* | regular expression | A pattern that entered data needs to follow. |

```typescript
// Invalid value
expect(pattern(/^[a-b]/)('z')).toEqual(`The value 'z' doen't match the pattern /^[a-b]/`);
// Valid value
expect(pattern(/^[a-z0-9]*$/)('12ba')).toEqual(undefined);

// Passing customError
const errorMsg = 'Custom error.';
expect(pattern(/^[a-z0-9]*$/, errorMsg)('abc_123')).toEqual(errorMsg);
```

### Number
The **number** decoder takes an unknown value, validates it and returns an error or a number depending on the outcome of the validation.
```typescript
(options?: DecoderOption<number>) => (val: unknown, context?: Context | undefined) => number
```

```typescript
const age = v.number();

expect(age(20)).toEqual(20);
// validation of value except number
expect(() => age("twenty")).toThrow('Expected number but got string.');
```

#### Validators for Number

##### min
The **min** validator checks whether a value is greater than the minimum value specified. The two parameters of the validators are: *number* and *customError*.

```typescript
min(number, customError?)
```

| Name | Type | Description |
| ----------- | ----------- | ----------- |
| *number* | number | Minimum value that entered data needs to be greater than. |


```typescript
// Invalid value
expect(min(15)(12)).toEqual(`Value 12 should be greater than 15`);
// Valid value
expect(min(15)(17)).toEqual(undefined);

// Passing customError
const errorMsg = 'Custom error.';
expect(min(6, errorMsg)(5)).toEqual(errorMsg);
```

##### max
The **max** validator checks whether a value is smaller than the maximum value specified. The two parameters of the validators are: *number* and *customError*.

```typescript
max(number, customError?)
```

| Name | Type | Description |
| ----------- | ----------- | ----------- |
| *number* | number | Maximum value that entered data needs to be smaller than. |

```typescript
// Invalid value
expect(max(12)(15)).toEqual(`Value 15 should be smaller than 12`);
// Valid value
expect(max(6)(4)).toEqual(undefined);

// Passing customError
const errorMsg = 'Custom error.';
expect(max(3, errorMsg)(5)).toEqual(errorMsg);
```

### Boolean
The **boolean** decoder takes an unknown value, validates it and returns an error or a number depending on the outcome of the validation.
```typescript
(options?: DecoderOption<boolean>) => (val: unknown, context?: Context | undefined) => boolean
```

```typescript
const married = v.boolean();

expect(married(true)).toEqual(true);
// validation of value except boolean
expect(() => married(1)).toThrow('Expected boolean but got number.');
```
#### Validators for Boolean

##### isTrue
The **isTrue** validator checks whether a boolean value is true. The only parameter of the validator is: *customError*.

```typescript
isTrue(customError?)
```

| Name | Type | Description |
| ----------- | ----------- | ----------- |
| *customError* | string | It is the customized error. If a customized error isn't passed into the validator then it returns default error message. |


```typescript
// false value
const expectedError = `Expected true but got false`;
expect(isTrue()(false)).toEqual(expectedError);
// true value
expect(isTrue()(true)).toEqual(undefined);

// Passing customError
const errorMsg = `Custom error message`;
expect(isTrue(errorMsg)(false)).toEqual(errorMsg);
```

##### isFalse
The **isFalse** validator checks whether a boolean value is false. The only parameter of the validator is: *customError*.

```typescript
isFalse(customError?)
```

```typescript
// true value
const expectedError = `Expected false but got true`;
expect(isFalse()(true)).toEqual(expectedError);
// false value
expect(isFalse()(false)).toEqual(undefined);

// Passing customError
const errorMsg = `Custom error message`;
expect(isFalse(errorMsg)(true)).toEqual(errorMsg);
```

### Date
The **date** decoder takes an unknown value, validates if it and returns an error or a Date depending on the outcome of the validation.
```typescript
(options?: DecoderOption<Date>) => (val: unknown, context?: Context | undefined) => Date
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

#### Validators for Date

##### minDate
The **minDate** validator set the minimum date and checks whether the entered date comes after the minimum date. It takes two parameters: *date* and *customError*.

```typescript
minDate(date, customError?)
```

| Name | Type | Description |
| ----------- | ----------- | ----------- |
| *date* | date object | Minimum date that can be entered. |

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

##### maxDate
The **maxDate** validator set the maximum date and checks whether the entered date comes before the maximum date. It takes two parameters: *date* and *customError*.

```typescript
maxDate(date, customError?)
```

| Name | Type | Description |
| ----------- | ----------- | ----------- |
| *date* | date object | Maximum date that can be entered. |

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

### Literal
The **literal** decoder parses an any value, validates if it and returns an error or a Premitive value depending on the outcome of the validation. 

The type **Premitive** looks like :
```typescript
type Premitive = string | number | boolean | null | undefined;
```

**Signature of literal decoder**
```typescript
(val: T, options?: DecoderOption<Premitive>) => (val: any, context?: Context | undefined) => Premitive
```

```typescript
const apple = v.literal('apple');

expect(apple('apple')).toEqual('apple');
expect(() => apple('banana')).toThrow(`Expected 'apple', but got 'banana'.`);
```

### Object
The **object** decoder parses any value, validates if it and returns an error or a Schema value depending on the outcome of the validation.

**Schema**
```typescript
type Schema = Record<string, Decoder | Switch<any>>;
```
**Signature of object decoder**
```typescript
(schema: T, option?: ObjectOption) => (rawData: any, context?: Context) => Schema
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

### Partial

```typescript
(schema: T, option?: PartialOption) => (val: any, context?: Context) => Schema
```
```typescript
// making all fields optional
const userSchema = partial({
username: string(),
password: string(),
});
expect(userSchema({})).toEqual({});

// working with toggle
const userSchema = partial({
  username: string(),
  password: toggle(string()),
});
expect(userSchema.bind(userSchema, {})).toThrow('');
```

### Array
The **array** decoder parses any value, validates if its value is of type Arrary and returns an error or an Array value depending on the outcome of the validation.

**Decoder**
```typescript
type Decoder = (value: any, context?: Context) => any;
```
**Signature of object decoder**
```typescript
(schema: T, option?: ArrayOptions>) => (val: any, context?: Context) => Array
```

```typescript
const namesSchema = array(string());
const value = ['foo', 'bar'];
// valid value
expect(namesSchema(value)).toEqual(value);

const value = [1, undefined];
const expectedError = [
  { index: 0, error: 'Expected string but got number.' },
  { index: 1, error: 'Expected string but got undefined.' },
];
// invalid value
expect(namesSchema.bind(namesSchema, value)).toThrow(
  JSON.stringify(expectedError),
);

const expectedError = [
  { index: 0, error: 'Expected string but got undefined.' },
];
// Non-array value
expect(namesSchema.bind(namesSchema, undefined)).toThrow(
  JSON.stringify(expectedError),
);

const expectedError = [
  { index: 0, error: 'Expected string but got undefined.' },
];
// empty array validation
expect(namesSchema.bind(namesSchema, [])).toThrow(
  JSON.stringify(expectedError),
);

// custom validation
const expectedError = `Only 2 items are allowed`;
function allowOnly2(values: string[]) {
  if (values.length > 2) return expectedError;
}
const namesSchema = array(string(), allowOnly2);
expect(namesSchema.bind(namesSchema, ['a', 'b', 'c', 'd'])).toThrow(
  expectedError,
);
```

### Enum
The **enum** decoder parses any value, validates if its value is of type EnumValues and returns an error or a EnumValues value depending on the outcome of the validation.
```typescript
type EnumValues = string | number | boolean;
```
**Signature of object decoder**
```typescript
(values: [...T], option?: DecoderOption<T>) => (val: unknown, context?: Context) => EnumValues
```

```Typescript
const fruits = v.enum(['apple', 'banana']);

// valid value
const apple = 'apple';
expect(fruits(apple)).toEqual(apple);

// invalid value
const expectedError = `Expected one of ['apple', 'banana'] but got 'tomato'.`;
expect(() => fruits('tomato')).toThrow(expectedError);
```

### Union
```typescript
(schemas: T, option?: DecoderOption<K>) => (val: unknown, context?: Context) => T
```

```typescript
const alphaNumeric = union([string(), number()]);

// valid values
expect(alphaNumeric('a')).toEqual('a');
expect(alphaNumeric(1)).toEqual(1);

// invalid value
expect(() => alphaNumeric(true)).toThrow(
  'The value did not match any of the given schemas.',
);
```
___










