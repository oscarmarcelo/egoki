import test from 'ava';

import Schema from '../../../source/index.js';



// =============================================================================
// Defaults
// =============================================================================

test('ObjectSchema.resolve() applies property default values before merging', t => {
	t.deepEqual(
		Schema.object()
			.properties({
				name: Schema.string()
					.default('John'),
			})
			.resolve(
				{},
				{},
			),
		{
			name: 'John',
		},
	);
});



// =============================================================================
// Merge
// =============================================================================

test('ObjectSchema.resolve() deep merges the resolved target runtime value with the source runtime value', t => {
	t.deepEqual(
		Schema.object()
			.properties({
				name: Schema.string(),
			})
			.resolve(
				{
					name: 'John',
				},
				{
					name: 'Jane',
				},
			),
		{
			name: 'Jane',
		},
	);
});



test('ObjectSchema.resolve() applies defaults recursively before merging', t => {
	const schema = Schema.object()
		.properties({
			user: Schema.object()
				.properties({
					name: Schema.string()
						.default('John'),
				}),
		});

	t.deepEqual(
		schema.resolve(
			{
				user: {},
			},
			{},
		),
		{
			user: {
				name: 'John',
			},
		},
	);
});
