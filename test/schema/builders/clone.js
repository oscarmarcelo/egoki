import test from 'ava';

import Schema from '../../../source/index.js';



test('Schema.clone() preserves the schema behavior', t => {
	const schema = Schema.string()
		.optional()
		.default('value')
		.enum([
			'value',
			'other',
		]);

	const clone = schema.clone();

	t.not(
		clone,
		schema,
	);

	t.true(
		clone.test('value'),
	);

	t.true(
		clone.test(undefined),
	);

	t.false(
		clone.test('unexpected'),
	);
});


test('Schema.clone() returns an independent copy of the schema', t => {
	const schema = Schema.string();

	const clone = schema.clone()
		.optional()
		.default('value')
		.enum([
			'value',
			'other',
		]);

	t.true(
		schema.test('another'),
	);

	t.false(
		clone.test('another'),
	);

	t.true(
		clone.test('value'),
	);

	t.false(
		schema.test(undefined),
	);

	t.true(
		clone.test(undefined),
	);
});


test('Schema.clone() preserves composite schema behavior', t => {
	const schema = Schema.object({
		name: Schema.string().default('Anonymous'),
	}).deep();

	const clone = schema.clone();

	t.deepEqual(
		clone.resolve(
			{},
			{
				name: 'Alice',
			},
		),
		{
			name: 'Alice',
		},
	);

	t.deepEqual(
		schema.applyDefaults({}),
		{
			name: 'Anonymous',
		},
	);
});
