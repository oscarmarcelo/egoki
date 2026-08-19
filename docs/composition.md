# Schema composition

`extend()` creates a new schema by composing two schemas of the same root type. It is immutable and operates on schema definitions rather than runtime values.

## Basic extension

```js
const base = Schema.object({
	name: Schema.string(),
});

const extension = Schema.object({
	age: Schema.number(),
});

const combined = base.extend(extension);
```

The combined schema contains both properties. Neither input schema changes.

## Recursive extension

When corresponding nested schemas have the same concrete type, extension recurses into them:

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
});

const combined = base.extend(extension);
```

The resulting `options` schema requires both `enabled` and `timeout`. This also applies to array `items` and object `additionalProperties` schemas.

## Nested conflicts

If corresponding nested schemas have different concrete types, the extension schema replaces the existing nested schema:

```js
const combined = Schema.object({
	value: Schema.string(),
}).extend(
	Schema.object({
		value: Schema.number(),
	}),
);
```

The resulting `value` schema is a number schema. `extend()` does not implicitly create a union.

## Root conflicts

The root schema types must match:

```js
Schema.string().extend(Schema.number());
// throws TypeError
```

This prevents `extend()` from silently becoming a replacement operation at its root.

## Option precedence

When both schemas define the same schema option, the extension schema takes precedence. Options that the extension schema does not define are preserved from the receiving schema. The resulting schema must remain internally valid.

For example, an extension can replace an enum or merge strategy, while an existing default remains when the extension does not configure one.


## Extending unions

Unions recurse pairwise only when both schemas contain the same number of alternatives and the concrete schema types match at every position. Otherwise, the extension's complete alternative list replaces the base list.

`extend()` never broadens a union by implicitly combining alternatives, and it never reorders or matches alternatives outside their declared positions.

See [Unions](unions.md) for examples and the complete compatibility rules.


## Extension versus merging

Schema composition and runtime value merging are deliberately separate:

- `extend()` composes schema definitions.
- `merge()` combines runtime values according to a schema's merge strategy.

`extend()` never applies a runtime merge strategy to schemas.

Configured options are still required to form a valid resulting schema. For primitive schemas, an extension `enum` replaces the base `enum`; it is not combined with it. Any preserved or extension default must satisfy that effective enum and all other resulting constraints, otherwise `extend()` throws a `TypeError`.
