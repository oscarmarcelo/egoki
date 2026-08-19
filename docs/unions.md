# Unions

`Schema.union()` creates a schema that accepts a value when at least one configured alternative schema accepts it.



## Creating a union

Pass a non-empty array of schemas:

```js
const schema = Schema.union([
	Schema.string(),
	Schema.number(),
]);

schema.test('text');
// true

schema.test(42);
// true

schema.test(false);
// false
```

A union may contain a single alternative. It remains a union schema, which makes dynamically assembled alternative lists straightforward to use without special-casing their length.

Alternatives retain their declaration order. They may use the same schema type and may overlap in the values they accept. Matching is inclusive: a value remains valid when more than one alternative accepts it.



## Nested unions

A union can be used anywhere another schema can be used, including array items, declared object properties, and additional object properties:

```js
const schema = Schema.object({
	value: Schema.union([
		Schema.string(),
		Schema.number(),
	]),
});
```

```js
const schema = Schema.array(
	Schema.union([
		Schema.string(),
		Schema.number(),
	]),
);
```

```js
const schema = Schema.object()
	.additionalProperties(
		Schema.union([
			Schema.string(),
			Schema.number(),
		]),
	);
```



## Required and default values

Presence and root defaults belong to the union itself. An optional alternative does not make the union optional, and an alternative's root default does not become the union's default.

```js
Schema.union([
	Schema.string().optional(),
	Schema.number(),
]).test(undefined);
// false
```

Configure the union explicitly instead:

```js
Schema.union([
	Schema.string(),
	Schema.number(),
])
	.optional()
	.test(undefined);
// true
```

```js
Schema.union([
	Schema.string(),
	Schema.number(),
])
	.default('text')
	.applyDefaults(undefined);
// 'text'
```

Nested defaults inside an alternative still apply to a defined value. When several alternatives could produce a valid defaulted result, declaration order decides which one is used.

```js
Schema.union([
	Schema.object({
		name: Schema.string().default('Anonymous'),
	}),
	Schema.string(),
]).applyDefaults({});
// {name: 'Anonymous'}
```



## Validation errors

When no alternative accepts a value, the union reports one validation issue for that union location rather than exposing every rejected alternative as a separate issue.

This keeps a failed union constraint represented as one failure: the value did not satisfy any configured alternative.



## Merging

Unions use replacement merging by default, just like primitive schemas and arrays. They do not infer or dispatch to a merge strategy from the alternative that happens to match a runtime value.

```js
const source = {right: true};

Schema.union([
	Schema.object(),
	Schema.string(),
]).merge(
	{left: true},
	source,
) === source;
// true
```

`.replace()` is available as the common explicit replacement builder.



## Extending unions

Two unions are extended pairwise only when they have the same number of alternatives and the concrete schema type at every position matches.

```js
const combined = Schema.union([
	Schema.string(),
	Schema.object({
		name: Schema.string(),
	}),
]).extend(
	Schema.union([
		Schema.string().enum(['auto']),
		Schema.object({
			age: Schema.number(),
		}),
	]),
);
```

Here the two string alternatives extend one another, and the two object alternatives extend one another recursively.

If the layouts are incompatible, the extension union's complete alternative list replaces the base list. `extend()` never broadens a union by silently combining both lists.

```js
Schema.union([
	Schema.string(),
	Schema.number(),
]).extend(
	Schema.union([
		Schema.number(),
		Schema.boolean(),
	]),
);

// number | boolean
```

Alternative position is significant. Egoki does not attempt to infer semantic correspondence between alternatives of the same or different types.
