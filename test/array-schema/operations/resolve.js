import test from 'ava';

import Schema from '../../../source/index.js';



// =============================================================================
// Append
// =============================================================================

test('ArraySchema.resolve() appends the source runtime value to the configured default runtime value', t => {
	t.deepEqual(
		Schema.array()
			.default([
				1,
				2,
			])
			.append()
			.resolve(
				undefined,
				[
					3,
				],
			),
		[
			1,
			2,
			3,
		],
	);
});



// =============================================================================
// Prepend
// =============================================================================

test('ArraySchema.resolve() prepends the source runtime value to the configured default runtime value', t => {
	t.deepEqual(
		Schema.array()
			.default([
				2,
				3,
			])
			.prepend()
			.resolve(
				undefined,
				[
					1,
				],
			),
		[
			1,
			2,
			3,
		],
	);
});



// =============================================================================
// Deep Merge
// =============================================================================

test('ArraySchema.resolve() applies defaults recursively to array items before merging', t => {
	const schema = Schema.array()
		.items(
			Schema.object()
				.properties({
					name: Schema.string()
						.default('John'),
				}),
		)
		.append();

	t.deepEqual(
		schema.resolve(
			[
				{},
			],
			[],
		),
		[
			{
				name: 'John',
			},
		],
	);
});



// =============================================================================
// Immutability
// =============================================================================

test('ArraySchema.resolve() does not modify either supplied runtime value', t => {
	const schema = Schema.array()
		.items(
			Schema.number(),
		)
		.append();

	const target = [
		1,
		2,
	];

	const source = [
		3,
	];

	schema.resolve(target, source);

	t.deepEqual(
		target,
		[
			1,
			2,
		],
	);

	t.deepEqual(
		source,
		[
			3,
		],
	);
});
