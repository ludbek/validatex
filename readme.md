# validatex
A simple yet powerful data validator for Javascript/Typescript.

## [v1.x doc](https://github.com/ludbek/validatex/tree/v1.0.2)

## Migration from v1.x to v2.x

## Features
- functions as decoders/validators
- supports Typescript
- runtime type support
- easy to extend
- easy to create custom decoders/validators

## Kitchen Sink
```typescript
import v, Typeof from 'validatex'

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
		"_index":1,
		"error": {
			"name":"Expected string but got undefined.",
			"address":{
				"street2":"Expected string but got undefined."
			}
		}
	}
]);
expect(() => userSchema(userSchema, value2).toThrow(expectedError);
```

## Core concepts
### Decoders
### Validators
### Runtime types

## Builtin decoders
### string
### number
### boolean
### literal
### object
### partial
### array
### enum
### union

## Extending decoders

## Custom decoders
