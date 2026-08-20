# Resolution

Egoki exposes defaulting, merging, and validation as separate schema operations. `resolve()` composes them into a single operation.



## `resolve(target, ...sources)`

Resolution performs these internal steps:

1. Apply defaults to the target without public validation.
2. Merge every source into the accumulated result from left to right without public validation.
3. Apply defaults again to the complete merged result without public validation.
4. Validate the final result once.

```js
const schema = Schema.object({
	format: Schema.string(),
	quality: Schema.number().default(80),
	options: Schema.object({
		lossless: Schema.boolean().default(false),
	}),
});

schema.resolve(
	{quality: 70},
	{format: 'webp'},
	{options: {lossless: true}},
	{quality: 60},
);
// {
//   format: 'webp',
//   quality: 60,
//   options: {lossless: true},
// }
```

Incomplete targets, sources, and intermediate merged values are permitted. Only the final resolved value must satisfy the complete schema.

This is intentionally **not** equivalent to composing the public `applyDefaults()`, `merge()`, and `validate()` methods. Those public operations guarantee valid returned values individually, which would introduce validation boundaries too early for transactional resolution.

Ordinary two-value calls remain supported:

```js
schema.resolve(target, source);
```

With one argument, the target is defaulted and then validated. With no arguments, resolution starts from `undefined`, so a root default may supply the value; otherwise normal required/optional validation applies.



## Defaults form the base layer

Defaults are applied to the target before any sources are merged. They therefore form the lowest-precedence configuration layer.

This matters for merge strategies that combine rather than replace values:

```js
const schema = Schema.array(Schema.string())
	.append()
	.default(['default']);

schema.resolve(
	undefined,
	['configured'],
);
// ['default', 'configured']
```

For prepend and keyed-array strategies, the same principle applies: the defaulted target participates in the first merge step instead of disappearing merely because a source is defined.

Explicit source values continue to supersede defaults according to the configured merge strategy. Defaults never replace already defined values, including `null`.



## Final defaulting pass

Defaults are applied again after all sources have been merged. This allows sources to introduce structures that themselves contain omitted values with defaults.

```js
const schema = Schema.object({
	options: Schema.object({
		enabled: Schema.boolean().default(true),
	}),
});

schema.resolve(
	{},
	{options: {}},
);
// {
//   options: {
//     enabled: true,
//   },
// }
```

The final pass also covers structures introduced through replacement merging, new keyed-array items, nested array items, additional properties, and union alternatives selected by later sources.



## Source precedence

Sources are processed from left to right. Every source is merged into the result accumulated so far, so later sources have greater precedence where the strategy replaces matching values.

```js
Schema.object({
	value: Schema.string(),
}).resolve(
	{value: 'target'},
	{value: 'first'},
	{value: 'second'},
);
// {value: 'second'}
```

An `undefined` source retains the accumulated target according to the normal merge semantics.



## Immutability

`resolve()` does not modify the schema, target, sources, or configured defaults.

The returned value follows the identity-sharing behavior of the internal defaulting and merge strategies. Repeated calls do not share mutations introduced into earlier results through Egoki's transformations.



## Errors

Merge-strategy errors still occur at the step that encounters the invalid merge input. Validation errors are produced only for the final resolved value and retain the normal issue schema, path, value, and message information.



## When to use `resolve()`

Use `resolve()` when configuration fragments may be incomplete independently and should be defaulted, merged, and validated as one transaction.

Use `applyDefaults()`, `merge()`, or `validate()` individually when you specifically need one of those public operation boundaries. Each individual public value-producing operation still guarantees that any value it returns satisfies the schema.


## Unions

For a union schema, `resolve()` retains the union's own merge strategy. The final defaulting pass can apply nested defaults to an alternative introduced by a later source before the union is validated. See [Unions](unions.md) for the underlying union behavior.
