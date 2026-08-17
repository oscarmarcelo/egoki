# Validation

Egoki separates schema configuration from runtime validation. Builder methods configure a schema, while `validate()` and `test()` operate on runtime values.



## `validate(value)`

`validate()` checks the complete value against the schema.

When validation succeeds, it returns the original value:

```js
const schema = Schema.string();
const value = 'hello';

schema.validate(value) === value;
// ↳ true
```

Validation never changes the schema or the supplied runtime value.

When validation fails, `validate()` throws a `ValidationError` containing all issues discovered during the operation.



## `test(value)`

`test()` is the boolean form of validation:

```js
Schema.number().test(42);
// ↳ true

Schema.number().test('42');
// ↳ false
```

It returns `false` for any validation failure and does not expose the validation issues.



## Required and optional values

Schemas are required by default. An omitted value is represented by `undefined`.

```js
Schema.string().test(undefined);
// ↳ false

Schema.string().optional().test(undefined);
// ↳ true
```

`.required()` configures the required flag explicitly, while `.optional()` is equivalent to `.required(false)`.



## Enumerations

`.enum()` restricts a schema to an allowed set of values.

```js
const schema = Schema.string().enum(['draft', 'published']);

schema.test('draft');
// ↳ true

schema.test('archived');
// ↳ false
```

The values supplied to `.enum()` must be compatible with the schema, and the enum cannot be empty.



## Nested validation

Array and object schemas recurse into their configured child schemas.

```js
const schema = Schema.object({
	name: Schema.string(),
	roles: Schema.array(Schema.string()),
});

schema.validate({
	name: 'Ada',
	roles: ['admin', 'editor'],
});
```

Object schemas validate declared properties and can optionally validate or reject additional properties.

```js
const schema = Schema.object({
	name: Schema.string(),
})
.additionalProperties(false);

schema.test({
	name: 'Ada',
	age: 36,
});
// ↳ false
```



## Validation issues

A `ValidationError` exposes the individual failures through `issues`. Each issue contains:

| Property | Description |
| - | - |
| `schema` | The schema that reported the issue. |
| `path` | The location of the invalid value. |
| `value` | The invalid runtime value. |
| `message` | A human-readable description of the failure. |

For example, validating:

```js
const schema = Schema.object({
	name: Schema.string(),
	age: Schema.number(),
});

schema.validate({
	name: 42,
	age: 'thirty-six',
});
```

produces a `ValidationError` with one issue for `name` and one for `age`.

The `path` is intended for programmatic handling, so callers do not need to parse the human-readable message.
