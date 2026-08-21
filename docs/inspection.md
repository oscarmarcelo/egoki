# Schema Inspection

Egoki schemas expose their concrete type and can be navigated without inspecting internal configuration.



## Schema types

Every schema has a read-only `type` property:

```js
Schema.string().type;
// 'string'

Schema.object().type;
// 'object'
```

The public type values are `string`, `number`, `boolean`, `array`, `object`, and `union`.

`Schema.isSchema()` can optionally assert the concrete type:

```js
Schema.isSchema(Schema.string());
// true

Schema.isSchema(Schema.string(), 'string');
// true

Schema.isSchema(Schema.string(), 'number');
// false
```

An invalid type name throws a `TypeError`.



## Explicit schema lookup

`get()` returns the schema explicitly configured at a path, or `undefined` when the path does not resolve unambiguously.

```js
const name = Schema.string();
const schema = Schema.object({
	user: Schema.object({
		name,
	}),
});

schema.get(['user', 'name']) === name;
// true

schema.get('user.name') === name;
// true
```

The array form is canonical and supports property names containing dots. Dot notation is intentionally simple: it splits on literal `.` characters and does not support escaping or bracket syntax.

Calling `get()` with no path, `undefined`, or `[]` returns the receiving schema. An empty string is a real property key rather than a root-path alias.



## Arrays

Array navigation consumes a non-negative integer index and follows the configured item schema. Because every array item shares the same item schema, the numeric value of the index does not select a different schema.

```js
const item = Schema.string();
const schema = Schema.array(item);

schema.get([0]) === item;
schema.get([42]) === item;
schema.get('0') === item;
```

A canonical decimal string is interpreted as an index only while traversing an array. On an object, `'0'` remains the object property named `'0'`.



## Additional properties

`get()` navigates only explicitly declared object properties. It does not use `additionalProperties()` as an implicit structural location.

```js
const schema = Schema.object()
	.additionalProperties(Schema.number());

schema.get(['count']);
// undefined
```

Use `getSchemas()` when you want schemas that may apply to a runtime location:

```js
schema.getSchemas(['count']);
// [NumberSchema]
```

A declared property takes precedence over `additionalProperties` within the same object branch.



## Union-aware lookup

`getSchemas()` always returns an array. It traverses union alternatives whenever path segments remain, including nested unions.

```js
const schema = Schema.union([
	Schema.object({value: Schema.string()}),
	Schema.object({value: Schema.number()}),
]);

schema.getSchemas(['value']);
// [StringSchema, NumberSchema]
```

Alternatives that cannot resolve the path contribute no result. If the path ends at a union itself, that `UnionSchema` is returned as the result rather than being flattened or replaced with a synthesized union.

`get()` does not traverse union alternatives and returns `undefined` when a union is encountered before the path is exhausted.



## Result ordering and deduplication

`getSchemas()` preserves traversal order. If the exact same schema instance is reached through multiple routes, it appears only once at its first position. Separate schema instances remain separate results even when their configuration is equivalent.
