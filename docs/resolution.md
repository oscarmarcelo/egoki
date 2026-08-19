# Resolution

Egoki exposes defaulting, merging, and validation as separate schema operations. `resolve()` composes them into a single operation.



## `resolve(target, source)`

`resolve()` performs three operations in order:

1. Apply defaults to `target`.
2. Merge `source` into the defaulted target.
3. Validate the merged result.

```js
const schema = Schema.object({
	name: Schema.string().default('Anonymous'),
	age: Schema.number(),
});

schema.resolve(
	{},
	{
		age: 42,
	},
);
// {name: 'Anonymous', age: 42}
```

`resolve()` is equivalent to:

```js
schema.validate(
	schema.merge(
		schema.applyDefaults(target),
		source,
	),
);
```



## Immutability

`resolve()` does not modify the schema or either supplied runtime value.

The returned value is a new resolved value when the underlying operations produce one, while preserving the identity behavior defined by the configured merge strategy.



## Errors

Exceptions thrown by `applyDefaults()`, `merge()`, or `validate()` propagate unchanged.



## When to use `resolve()`

Use `resolve()` when the desired operation is the complete schema pipeline:

```js
schema.resolve(target, source);
```

Use `applyDefaults()`, `merge()`, or `validate()` individually when you need control over the individual stages or do not need all of them. `applyDefaults()` and `merge()` still guarantee that any returned value satisfies the schema.


## Unions

For a union schema, `resolve()` follows the same pipeline without adding union-specific resolution semantics. Union-aware default application runs first, replacement merging runs second, and the final value must satisfy at least one alternative. See [Unions](unions.md) for the underlying union behavior.
