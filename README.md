# Egoki

From Basque (`/eˈɣ̞o.ki/` → eh-GOH-kee), meaning “suitable, appropriate, fitting”

> A composable JavaScript schema library for constructing, validating, and merging structured values.



## Features

- Compose schemas with an immutable fluent API.
- Extend compatible schemas recursively without mutating either schema.
- Inspect schema types and navigate configured schema structures.
- Validate primitive values, arrays, plain objects, and explicit unions of schemas.
- Configure required and optional values, defaults, and allowed values.
- Recursively validate, default, and merge nested arrays and objects.
- Merge values according to the schema that describes them.
- Collect multiple validation issues in a single `ValidationError`.
- Uses a single dependency ([Hermēneíā](https://github.com/oscarmarcelo/hermeneia)), also maintained by the same author.



## Installation

```bash
npm install egoki
```



## Usage

Egoki schemas are built with `Schema` factory methods and configured with chainable methods. Schema operations never modify the supplied schema or runtime values. Value-producing operations return values that satisfy the schema, or throw instead of returning an invalid value.


### Creating schemas

```js
import Schema from 'egoki';

const userSchema = Schema.object({
	name: Schema.string(),
	age: Schema.number().optional(),
	active: Schema.boolean().default(true),
	identifier: Schema.union([
		Schema.string(),
		Schema.number(),
	]),
});
```

Schemas are immutable. Builder methods return a new schema instead of changing the schema they are called on.

```js
const requiredName = Schema.string();
const optionalName = requiredName.optional();

requiredName === optionalName;
// ↳ false
```


### Union schemas

Use `Schema.union()` when a value may satisfy any of several explicit schemas.

```js
const identifierSchema = Schema.union([
	Schema.string(),
	Schema.number(),
]);

identifierSchema.test('user-42');
// ↳ true

identifierSchema.test(42);
// ↳ true
```

Union alternatives are ordered and use inclusive OR semantics. The union itself owns required/optional behavior and root defaults; nested defaults inside a selected alternative still apply.

See [Unions](docs/unions.md) for validation, defaulting, merging, and extension behavior.


### Inspecting schemas

Every schema exposes a read-only `type` property, and `Schema.isSchema()` can optionally require a specific schema type.

```js
const schema = Schema.object({
	user: Schema.object({
		name: Schema.string(),
	}),
});

schema.type;
// ↳ 'object'

Schema.isSchema(schema, 'object');
// ↳ true
```

Use `get()` to retrieve an explicitly declared schema at a path. Use `getSchemas()` when a path may resolve through union alternatives or schema-valued additional properties. Array paths are the precise form; simple dot-separated strings are also supported.

```js
const nameSchema = schema.get(['user', 'name']);
// ↳ StringSchema

const possible = Schema.union([
	Schema.object({
		value: Schema.string(),
	}),
	Schema.object({
		value: Schema.number(),
	}),
]).getSchemas('value');
// ↳ [StringSchema, NumberSchema]
```

See [Schema Inspection](docs/inspection.md) for path syntax, arrays, unions, and additional properties.


### Validating values

Use `validate()` when the invalid value itself should produce an exception, or `test()` when a boolean result is enough.

```js
userSchema.validate({
	name: 'Ada',
	age: 36,
	active: true,
	identifier: 'user-42',
});
// ↳ {name: 'Ada', age: 36, active: true, identifier: 'user-42'}
```

```js
userSchema.test({
	name: 42,
	active: true,
	identifier: 'user-42',
});
// ↳ false
```

A failed validation throws `ValidationError`. It contains every issue discovered during the operation, including the path and invalid value.

```js
import Schema, {ValidationError} from 'egoki';

try {
	userSchema.validate({
		name: 42,
		active: true,
		identifier: 'user-42',
	});
} catch (error) {
	if (error instanceof ValidationError) {
		console.log(error.issues);
	}
}
```

See [Validation](docs/validation.md) for validation behavior and structured issues.


### Defaults

Use `default()` to provide a value when the runtime value is `undefined`. Defaults are applied explicitly with `applyDefaults()`.

```js
const schema = Schema.object({
	name: Schema.string().default('Anonymous'),
});

schema.applyDefaults({});
// ↳ {name: 'Anonymous'}
```

Defaults can be applied recursively to nested schemas and additional properties configured with a schema.

See [Defaults](docs/defaults.md) for configuring and applying default values.


### Merging values

`merge()` combines a target and source according to the schema's merge strategy.

```js
const schema = Schema.object({
	name: Schema.string(),
	settings: Schema.object({
		language: Schema.string(),
	}),
});

schema.merge(
	{
		name: 'Ada',
		settings: {language: 'en'},
	},
	{
		settings: {language: 'pt'},
	},
);
// ↳ {
//    name: 'Ada',
//    settings: {language: 'pt'},
//   }
```

Arrays use replacement by default, but can be configured to append, prepend, or merge items by a key. Keyed merging requires every item to contain the configured key and requires keys to be unique within each input array.

```js
const schema = Schema.array(
	Schema.number(),
).append();

schema.merge([1, 2], [3, 4]);
// ↳ [1, 2, 3, 4]
```

See [Merging](docs/merging.md) for the available strategies and recursive behavior.


### Resolving values

`resolve()` combines defaulting, merging, and validation into one operation. It first applies defaults to the target, merges the source, and validates the resulting value.

```js
const schema = Schema.object({
	name: Schema.string().default('Anonymous'),
});

schema.resolve({}, {});
// ↳ {name: 'Anonymous'}
```

See [Resolution](docs/resolution.md) for applying defaults, merging values, and validating the result.


### Extending schemas

Use `extend()` to compose two schemas of the same root type. The result is a new schema and neither input is modified.

Compatible nested schemas are extended recursively. When nested schema types are incompatible, the extension schema replaces the existing nested schema. The root schema type itself must match.

```js
const base = Schema.object({
	options: Schema.object({
		enabled: Schema.boolean(),
	}),
});

const extension = Schema.object({
	options: Schema.object({
		timeout: Schema.number(),
	}),
	variants: Schema.array(Schema.object()),
});

const combined = base.extend(extension);
```

`extend()` composes schema definitions only. It does not use runtime merge strategies; `merge()` remains the operation for combining runtime values.

See [Composition](docs/composition.md) for recursive behavior and option precedence.



## API

### `Schema`

The default and named `Schema` exports provide the factory and utility methods used to create schemas. `ValidationError` is also available as a named export.

| Method | Parameters | Returns | Description |
| - | - | - | - |
| `Schema.string()` | — | `StringSchema` | Creates a string schema. |
| `Schema.number()` | — | `NumberSchema` | Creates a number schema. |
| `Schema.boolean()` | — | `BooleanSchema` | Creates a boolean schema. |
| `Schema.array(items?)` | `Schema` | `ArraySchema` | Creates an array schema, optionally with an item schema. |
| `Schema.object(properties?)` | `Record<string, Schema>` | `ObjectSchema` | Creates an object schema, optionally with declared property schemas. |
| `Schema.union(schemas)` | `Schema[]` | `UnionSchema` | Creates a schema accepting at least one alternative. |
| `Schema.isSchema(value, type?)` | `unknown`, `string` | `boolean` | Determines whether a value is a schema instance, optionally of a specific type. |


### Common schema properties and methods

All schemas expose the following public API from `Schema`.

| Property | Type | Description |
| - | - | - |
| `.type` | `string` | The schema's concrete public type. |


| Method | Parameters | Returns | Description |
| - | - | - | - |
| `.required(required?)` | `boolean` | `this` | Configures whether a value is required. |
| `.optional()` | — | `this` | Makes a value optional. |
| `.default(value)` | `unknown` | `this` | Configures a default value when none is defined. |
| `.clone()` | — | `this` | Creates a distinct schema with equivalent behavior. |
| `.replace()` | — | `this` | Replaces source values with target values during merging. |
| `.extend(schema)` | `Schema` | `this` | Extends a schema of the same root type without mutating either schema. |
| `.get(path?)` | `string \| Array<string \| number>` | `Schema \| undefined` | Returns the explicitly configured schema at a path. |
| `.getSchemas(path?)` | `string \| Array<string \| number>` | `Schema[]` | Returns configured schemas that may apply at a path. |
| `.validate(value)` | `unknown` | `unknown` | Validates a value and throws on failure. |
| `.test(value)` | `unknown` | `boolean` | Tests whether a value satisfies the schema. |
| `.applyDefaults(value)` | `unknown` | `unknown` | Applies configured defaults and returns a value satisfying the schema. |
| `.merge(target, ...sources)` | `unknown`, `...unknown[]` | `unknown` | Merges sources from left to right and validates only the final result. |
| `.resolve(target, ...sources)` | `unknown`, `...unknown[]` | `unknown` | Resolves sources transactionally with defaults before and after merging, then validates once. |

Merge strategy builders are available only on the schemas that support the corresponding strategy.


### `StringSchema`, `NumberSchema`, and `BooleanSchema`

These schemas validate JavaScript strings, numbers, and booleans respectively.

| Method | Parameters | Returns | Description |
| - | - | - | - |
| `.enum(values)` | `unknown[]` | `this` | Restricts primitive runtime values to an allowed set. |

`enum()` is available only on primitive schemas. Array, object, and union schemas do not expose it. 


### `UnionSchema`

`UnionSchema` accepts a runtime value when at least one configured alternative schema accepts it. It uses replacement merging and can be nested anywhere another schema is accepted.

See [Unions](docs/unions.md) for alternative ordering, defaults, validation errors, and extension behavior.


### `ArraySchema`

`ArraySchema` validates arrays and can optionally validate each item with another schema.

| Method | Parameters | Returns | Description |
| - | - | - | - |
| `.items(schema)` | `Schema` | `this` | Configures the item schema. |
| `.append()` | — | `this` | Appends source items after target items during merging. |
| `.prepend()` | — | `this` | Prepends source items before target items during merging. |
| `.keyedBy(key)` | `string` | `this` | Matches array items by an object property during merging. |


### `ObjectSchema`

`ObjectSchema` validates plain objects and can define schemas for declared and additional properties.

| Method | Parameters | Returns | Description |
| - | - | - | - |
| `.properties(properties)` | `Record<string, Schema>` | `this` | Configures declared property schemas. |
| `.additionalProperties(schema)` | `Schema \| boolean` | `this` | Configures how undeclared properties are handled. |
| `.deep()` | — | `this` | Deep merges source values with target values during merging. |


### `ValidationError`

`ValidationError` extends `TypeError` and is thrown when validation fails.

| Property | Type | Description |
| - | - | - |
| `issues` | `object[]` | All validation issues, in discovery order. |
| `issue` | `object` | The first validation issue. |

See [Validation](docs/validation.md) for the structure of validation issues.



## Documentation

- [Validation](docs/validation.md) — validation behavior, errors, and structured issues.
- [Defaults](docs/defaults.md) — configuring and applying default values.
- [Merging](docs/merging.md) — merge strategies and recursive merging.
- [Resolution](docs/resolution.md) — applying defaults, merging values, and validating the result as one operation.
- [Composition](docs/composition.md) — composing and extending schemas.
- [Unions](docs/unions.md) — accepting values through one or more alternative schemas.
- [Inspection](docs/inspection.md) — inspecting schema types and retrieving schemas by path.
