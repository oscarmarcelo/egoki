# Merging

`merge(target, source)` combines two runtime values according to the schema's configured merge strategy.

The operation does not mutate either supplied value. The returned value always satisfies the schema. If merging produces an invalid result, `merge()` throws a `ValidationError` instead of returning it. A returned value may be one of the supplied values or share references with them when the configured strategy permits it. Builder methods also return new schemas, so merge configuration can be reused safely.



## Replacement

Replacement is the default strategy for primitive schemas and arrays.

```js
Schema.string().merge('old', 'new');
// ↳ 'new'

Schema.array().merge([1, 2], [3, 4]);
// ↳ [3, 4]
```

`.replace()` explicitly selects the replacement strategy.

If the source is `undefined`, the target is retained.



## Append

`.append()` appends source array elements after target elements.

```js
const schema = Schema.array(Schema.number()).append();

schema.merge([1, 2], [3, 4]);
// ↳ [1, 2, 3, 4]
```

The strategy requires both values to be arrays when a target exists.



## Prepend

`.prepend()` places source elements before target elements.

```js
const schema = Schema.array(Schema.number()).prepend();

schema.merge([1, 2], [3, 4]);
// ↳ [3, 4, 1, 2]
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

Matched elements are merged using the configured item schema when one exists. Without an item schema, a matching source element replaces the corresponding target element. Existing target elements retain their positions, while new source elements are added in source order.

Keyed merging is strict: every item in both input arrays must contain the configured key, and keys must be unique within each array. Missing or duplicate keys cause a `TypeError`.



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
	{settings: {language: 'en', theme: 'light'}},
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



## Strategy selection

| Schema | Default strategy | Available configuration |
| - | - | - |
| Primitive schemas | `replace` | `replace()` |
| `ArraySchema` | `replace` | `replace()`, `append()`, `prepend()`, `keyedBy()` |
| `ObjectSchema` | `deep` | `replace()`, `deep()` |

Strategy builders are available only on schemas that support them. This prevents incompatible merge configurations from being represented by the public API.
