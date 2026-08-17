# Defaults

Schemas can define default runtime values for cases where a value is omitted.



## `default(value)`

The `default()` method configures the default runtime value of a schema.

```js
const schema = Schema.string().default('Anonymous');
```

The configured default is used by `applyDefaults()` when the supplied runtime value is `undefined`.

A default does not replace an explicitly supplied value, including `null`:

```js
const schema = Schema.string().default('Anonymous');

schema.applyDefaults(undefined);
// 'Anonymous'

schema.applyDefaults('John');
// 'John'

schema.applyDefaults(null);
// throws ValidationError
```

The configured default must satisfy the complete schema, including nested property or item schemas and every configured constraint. For primitive schemas with an enum, it must also be one of the allowed values.

`default()` is immutable: it returns a new schema and does not modify the original schema.



## `applyDefaults(value)`

`applyDefaults()` applies configured defaults to omitted runtime values.

```js
Schema.string()
	.default('Anonymous')
	.applyDefaults(undefined);
// 'Anonymous'
```

Defaults are applied recursively when traversing nested schemas:

```js
const schema = Schema.object({
	name: Schema.string().default('Anonymous'),
});

schema.applyDefaults({});
// {name: 'Anonymous'}
```

Existing runtime values are preserved when they are valid:

```js
schema.applyDefaults({name: 'John'});
// {name: 'John'}
```

`applyDefaults()` validates the resulting value before returning it. If the result does not satisfy the schema, it throws a `ValidationError` instead of returning the invalid value. A default never replaces an explicitly supplied value, including `null`. So, for example, an explicitly supplied `null` still causes `ValidationError` for a string schema.

The operation does not modify either the schema or the supplied runtime value.



## Defaults and merging

`merge()` does not apply defaults automatically. If defaulting is required before merging, apply defaults explicitly or use `resolve()`, which performs the complete resolution pipeline.
