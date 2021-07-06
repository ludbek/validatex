# validatex
A simple yet powerful data validator for Javascript/Typescript.

## [v1.x doc](https://github.com/ludbek/validatex/tree/v1.0.2)

## Migration from v1.x to v2.x

## Features
- functions as decoders/validators
- supports Typescript
- static type inference
- easy to extend
- easy to create custom decoders/validators

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

## Core concepts
### Decoders
Decoder is a function that parses unkown value, validates it and returns a known value. A decoder has following signature.

```typescript
(val: unknown, context?: Context | undefined) => T
```
### Context
```typescript
type Context = {
    key?: string | undefined;
    index?: number | undefined;
    schema?: any;
}
```

### Compose complex decoder

### Validators
Validator is a function as its name suggests validates a known value. It returns an error if a value is invalid else returns nothing. A decoder uses 1 or many validators to validate a known value.

```typescript
(val: T, context?: Context | undefined) => string | Record<string, string> | undefined
```

### Static type inference
```typescript
import v, { TypeOf } from 'validatex'

const loginSchema = v.object({
  username: v.string(),
  password: v.string()
})

type LoginSchema = TypeOf<typeof loginSchema>
// type LoginSchema {
//   username: string,
//   password: string
//}
```

## Builtin decoders
### string
```typescript
(options?: DecoderOption<string>) => (val: any, context?: Context | undefined) => string
```

```typescript
const name = v.string()
```

#### Validate

```typescript
function alphaNumeric(val: string) {
  /[a-zA-Z][\da-zA-Z]+/.test(val) ? undefined: 'Must be alpha numeric.';
}

const username = v.string(alphaNumeric)
username('user1')
// user1

username('123')
// throws validation error 
```

#### Parse

#### Custom error message

### number
### boolean
### literal
### object
### partial
### array
### enum
### union
