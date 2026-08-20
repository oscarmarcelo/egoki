# Merging

`merge(target, ...sources)` combines runtime values according to the schema's configured merge strategy.

The first argument is the target. Every additional argument is a source, merged into the accumulated result from left to right. Later sources therefore have greater precedence whenever the configured strategy replaces the same value.

`merge()` does not validate the target, individual sources, or intermediate merged values. Only the final accumulated result is validated. This allows several individually incomplete fragments to be combined transactionally when the final value satisfies the schema.

The operation does not mutate the target or any source. A returned value may still be one of the supplied values or share references with them when the configured strategy permits it. Builder methods also return new schemas, so merge configuration can be reused safely.

Ordinary two-value calls remain supported:

```js
schema.merge(target, source);
```

With one argument, no merge step occurs and the target itself is validated:

```js
schema.merge(value);
```

With no arguments, `undefined` is validated. This succeeds only when `undefined` satisfies the schema.

A single array argument is always one runtime value, not a collection of merge inputs:

```js
Schema.array(Schema.number()).merge([1, 2]);
```



## Replacement

Replacement is the default strategy for primitive schemas, arrays, and unions.

```js
Schema.string().merge('old', 'new');
// ↳ 'new'

Schema.string().merge('old', 'new', 'newer');
// ↳ 'newer'

Schema.array().merge([1, 2], [3, 4]);
// ↳ [3, 4]
```

`.replace()` explicitly selects the replacement strategy.

If a source is `undefined`, the accumulated target is retained.



## Append

`.append()` appends each source array after the accumulated target.

```js
const schema = Schema.array(Schema.number()).append();

schema.merge([1, 2], [3], [4]);
// ↳ [1, 2, 3, 4]
```

The strategy requires every defined value it combines to be an array.



## Prepend

`.prepend()` places each source before the accumulated target.

```js
const schema = Schema.array(Schema.number()).prepend();

schema.merge([3, 4], [2], [1]);
// ↳ [1, 2, 3, 4]
```



## Keyed arrays

`.keyedBy(key)` merges array elements by the value of an object property.

```js
const schema = Schema.array(
	Schema.object({
		id: Schema.number(),
		name: Schema.string(),
	}),
)
.keyedBy('id');

schema.merge(
	[
		{id: 1, name: 'Ada'},
		{id: 2, name: 'Grace'},
	],
	[
		{id: 2, name: 'Grace Hopper'},
		{id: 3, name: 'Katherine'},
	],
);
// ↳ [
//    {id: 1, name: 'Ada'},
//    {id: 2, name: 'Grace Hopper'},
//    {id: 3, name: 'Katherine'},
//   ]
```

Matched elements are merged using the configured item schema when one exists. Without an item schema, a matching source element replaces the corresponding target element. Existing target elements retain their positions, while new source elements are added in source order. These rules apply at every source step in a multi-source merge.

Keyed merging is strict: every item in each participating array must contain the configured key, and keys must be unique within each array. Missing or duplicate keys cause a `TypeError`.



## Deep object merging

`ObjectSchema` uses deep merging by default. Declared properties are merged through their schemas.

```js
const schema = Schema.object({
	settings: Schema.object({
		language: Schema.string(),
		theme: Schema.string(),
	}),
});

schema.merge(
	{settings: {language: 'en'}},
	{settings: {theme: 'light'}},
	{settings: {language: 'pt'}},
);
// ↳ {settings: {language: 'pt', theme: 'light'}}
```

Additional properties can also participate in recursive merging when an additional-property schema is configured:

```js
const schema = Schema.object()
.additionalProperties(
	Schema.object({
		value: Schema.number(),
	}),
);
```

`.deep()` explicitly selects the deep strategy for an object schema.

Because only the final result is validated, required object properties may be supplied by different fragments:

```js
const schema = Schema.object({
	format: Schema.string(),
	quality: Schema.number(),
});

schema.merge(
	{quality: 70},
	{format: 'webp'},
);
// ↳ {format: 'webp', quality: 70}
```



## Strategy selection

| Schema | Default strategy | Available configuration |
| - | - | - |
| Primitive schemas | `replace` | `replace()` |
| `ArraySchema` | `replace` | `replace()`, `append()`, `prepend()`, `keyedBy()` |
| `ObjectSchema` | `deep` | `replace()`, `deep()` |
| `UnionSchema` | `replace` | `replace()` |

A union never infers a merge strategy from a matching alternative; its own replacement strategy remains authoritative.

Strategy builders are available only on schemas that support them. This prevents incompatible merge configurations from being represented by the public API.
