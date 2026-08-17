# Egoki

From Basque (`/eˈɣ̞o.ki/` → eh-GOH-kee), meaning “suitable, appropriate, fitting”

> A composable JavaScript schema library for constructing, validating, and merging structured values.



## Features

- Compose schemas with an immutable fluent API.
- Validate primitive values, arrays, and plain objects.
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
});
```

Schemas are immutable. Builder methods return a new schema instead of changing the schema they are called on.

```js
const requiredName = Schema.string();
const optionalName = requiredName.optional();

requiredName === optionalName;
// ↳ false
```

### Validating values

Use `validate()` when the invalid value itself should produce an exception, or `test()` when a boolean result is enough.

```js
userSchema.validate({
	name: 'Ada',
	age: 36,
});
// ↳ {name: 'Ada', age: 36}
```

```js
userSchema.test({
	name: 42,
});
// ↳ false
```

A failed validation throws `ValidationError`. It contains every issue discovered during the operation, including the path and invalid value.

```js
import Schema, {ValidationError} from 'egoki';

try {
	userSchema.validate({
		name: 42,
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
| `Schema.isSchema(value)` | `unknown` | `boolean` | Determines whether a value is a schema instance. |


### Common schema methods

All schemas expose the following public methods from `Schema`.

| Method | Parameters | Returns | Description |
| - | - | - | - |
| `.required(required?)` | `boolean` | `this` | Configures whether `undefined` is accepted. |
| `.optional()` | — | `this` | Makes `undefined` optional. |
| `.default(value)` | `unknown` | `this` | Configures a default value for `undefined`. |
| `.clone()` | — | `this` | Creates a distinct schema with equivalent behavior. |
| `.replace()` | — | `this` | Uses the replace merge strategy. |
| `.validate(value)` | `unknown` | `unknown` | Validates a value and throws on failure. |
| `.test(value)` | `unknown` | `boolean` | Tests whether a value satisfies the schema. |
| `.applyDefaults(value)` | `unknown` | `unknown` | Applies configured defaults and returns a value satisfying the schema. |
| `.merge(target, source)` | `unknown`, `unknown` | `unknown` | Merges two values and returns a result satisfying the schema. |
| `.resolve(target, source)` | `unknown`, `unknown` | `unknown` | Applies defaults, merges, and validates. |

`enum()` is available only on primitive schemas. Array and object schemas do not expose it. Merge strategy builders are available only on the schemas that support the corresponding strategy.

### `StringSchema`, `NumberSchema`, and `BooleanSchema`

These schemas validate JavaScript strings, numbers, and booleans respectively. They inherit the common schema methods above and also expose `.enum(values)`.

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
| `.deep()` | — | `this` | Configures recursive deep merging. |

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
