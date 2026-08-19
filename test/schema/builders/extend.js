import test from 'ava';

import Schema from '../../../source/index.js';
import assertTypeError from '../../helpers/assert-type-error.js';
import nonSchemas from '../../helpers/fixtures/non-schemas.js';
import schemas from '../../helpers/fixtures/schemas.js';
import label from '../../helpers/label.js';



// =============================================================================
// Builder Contract
// =============================================================================

for (const [name, createSchema] of Object.entries(schemas)) {
	test(`${name} schema exposes extend()`, t => {
		t.is(
			typeof createSchema().extend,
			'function',
		);
	});

	test(`${name} schema extend() returns a new schema instance`, t => {
		const schema = createSchema();

		t.not(
			schema.extend(createSchema()),
			schema,
		);
	});
}


for (const value of nonSchemas) {
	test(`Schema.extend() rejects ${label(value)} as the extension`, t => {
		assertTypeError(
			t,
			() => {
				Schema.string().extend(value);
			},
		);
	});
}


for (const [baseName, createBaseSchema] of Object.entries(schemas)) {
	const baseSchema = createBaseSchema();

	for (const [extensionName, createExtensionSchema] of Object.entries(schemas)) {
		if (baseName !== extensionName) {
			test(`Schema.${baseName}().extend() rejects a ${extensionName} root schema`, t => {
				assertTypeError(
					t,
					() => {
						baseSchema.extend(createExtensionSchema());
					},
				);
			});
		}
	}
}



// =============================================================================
// Common Schema Options
// =============================================================================

test('extend() applies extension schema options', t => {
	const schema = Schema.string()
		.optional()
		.default('base')
		.enum(['base', 'other']);

	const extended = schema.extend(
		Schema.string()
			.default('other')
			.enum(['other']),
	);

	t.false(
		extended.test(undefined),
	);

	t.true(
		extended.test('other'),
	);

	t.false(
		extended.test('base'),
	);
});


test('extend() preserves options not configured by the extension schema', t => {
	const schema = Schema.string()
		.optional()
		.default('base')
		.enum(['base', 'other']);

	const extended = schema.extend(Schema.string());

	t.false(
		extended.test(undefined),
	);

	t.true(
		extended.test('base'),
	);

	t.false(
		extended.test('unexpected'),
	);

	t.is(
		extended.applyDefaults(undefined), 'base',
	);
});


test('extend() applies the extension merge strategy', t => {
	const schema = Schema.array(Schema.number()).append();
	const extended = schema.extend(Schema.array(Schema.number()));

	t.deepEqual(
		extended.merge([1], [2]),
		[2],
	);
});


test('extend() replaces the configured enum with the extension enum', t => {
	const extended = Schema.string()
		.enum(['base', 'shared'])
		.extend(
			Schema.string().enum(['shared', 'extension']),
		);

	t.false(
		extended.test('base'),
	);

	t.true(
		extended.test('shared'),
	);

	t.true(
		extended.test('extension'),
	);
});


test('extend() rejects an extension enum that excludes the preserved default', t => {
	assertTypeError(
		t,
		() => {
			Schema.string()
				.default('base')
				.extend(
					Schema.string().enum(['extension']),
				);
		},
	);
});


test('extend() rejects an extension default outside the preserved enum', t => {
	assertTypeError(
		t,
		() => {
			Schema.string()
				.enum(['base'])
				.extend(
					Schema.string().default('extension'),
				);
		},
	);
});


test('extend() accepts an extension enum and default when they are compatible', t => {
	const extended = Schema.string()
		.default('base')
		.enum(['base'])
		.extend(
			Schema.string()
				.default('extension')
				.enum(['extension']),
		);

	t.is(
		extended.applyDefaults(undefined),
		'extension',
	);

	t.true(
		extended.test('extension'),
	);

	t.false(
		extended.test('base'),
	);
});



// =============================================================================
// ObjectSchema
// =============================================================================

test('ObjectSchema.extend() applies the extension merge strategy', t => {
	const schema = Schema.object({
		options: Schema.object(),
	}).deep();
	const extended = schema.extend(
		Schema.object({
			options: Schema.object(),
		}).replace(),
	);

	t.deepEqual(
		extended.merge(
			{options: {left: true}},
			{options: {right: true}},
		),
		{options: {right: true}},
	);
});


test('ObjectSchema.extend() adds extension properties', t => {
	const schema = Schema.object({
		name: Schema.string(),
	});

	const extended = schema.extend(
		Schema.object({
			age: Schema.number(),
		}),
	);

	t.true(
		extended.test({name: 'Ada', age: 36}),
	);

	t.false(
		extended.test({name: 'Ada'}),
	);
});


test('ObjectSchema.extend() recursively extends compatible property schemas', t => {
	const schema = Schema.object({
		options: Schema.object({
			enabled: Schema.boolean(),
		}),
	});

	const extended = schema.extend(
		Schema.object({
			options: Schema.object({
				timeout: Schema.number(), // eslint-disable-line unicorn/max-nested-calls
			}),
		}),
	);

	t.true(
		extended.test({
			options: {
				enabled: true,
				timeout: 1000,
			},
		}),
	);
});


test('ObjectSchema.extend() replaces incompatible property schemas', t => {
	const schema = Schema.object({
		value: Schema.string(),
	});

	const extended = schema.extend(
		Schema.object({
			value: Schema.number(),
		}),
	);

	t.true(
		extended.test({value: 1}),
	);

	t.false(
		extended.test({value: 'one'}),
	);
});


test('ObjectSchema.extend() recursively extends compatible additional-property schemas', t => {
	const schema = Schema.object()
		.additionalProperties(
			Schema.object({
				name: Schema.string(),
			}),
		);

	const extended = schema.extend(
		Schema.object()
			.additionalProperties(
				Schema.object({
					age: Schema.number(), // eslint-disable-line unicorn/max-nested-calls
				}),
			),
	);

	t.true(
		extended.test({
			user: {
				name: 'Ada',
				age: 1,
			},
		}),
	);
});


test('ObjectSchema.extend() replaces incompatible additional-property schemas', t => {
	const schema = Schema.object()
		.additionalProperties(Schema.string());

	const extended = schema.extend(
		Schema.object()
			.additionalProperties(Schema.number()),
	);

	t.true(
		extended.test({value: 1}),
	);

	t.false(
		extended.test({value: 'one'}),
	);
});



// =============================================================================
// ArraySchema
// =============================================================================

test('ArraySchema.extend() recursively extends compatible item schemas', t => {
	const schema = Schema.array(
		Schema.object({
			name: Schema.string(),
		}),
	);

	const extended = schema.extend(
		Schema.array(
			Schema.object({
				age: Schema.number(), // eslint-disable-line unicorn/max-nested-calls
			}),
		),
	);

	t.true(
		extended.test([
			{name: 'Ada', age: 36},
		]),
	);
});


test('ArraySchema.extend() replaces incompatible item schemas', t => {
	const schema = Schema.array(Schema.string());
	const extended = schema.extend(Schema.array(Schema.number()));

	t.true(
		extended.test([1, 2]),
	);

	t.false(
		extended.test(['one']),
	);
});



// =============================================================================
// Immutability
// =============================================================================

test('extend() does not modify either schema', t => {
	const base = Schema.object({
		name: Schema.string(),
	}).additionalProperties(false);
	const extension = Schema.object({
		age: Schema.number(),
	}).additionalProperties(false);

	const extended = base.extend(extension);

	t.true(
		base.test({name: 'Ada'}),
	);

	t.false(
		base.test({name: 'Ada', age: 36}),
	);

	t.true(
		extension.test({age: 36}),
	);

	t.false(
		extension.test({name: 'Ada', age: 36}),
	);

	t.true(
		extended.test({name: 'Ada', age: 36}),
	);
});


test('extend() rejects an extension that would invalidate its configured default', t => {
	assertTypeError(
		t,
		() => {
			Schema.object({
				value: Schema.string(),
			})
				.default({value: 'text'})
				.extend(
					Schema.object({
						value: Schema.number(),
					}),
				);
		},
	);
});
