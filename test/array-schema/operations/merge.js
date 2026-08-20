import test from 'ava';

import Schema from '../../../source/index.js';
import assertTypeError from '../../helpers/assert-type-error.js';
import assertValidationError from '../../helpers/assert-validation-error.js';
import {createKeyedObjectSchema} from '../../helpers/fixtures/create-schema.js';



// =============================================================================
// General Operation Semantics
// =============================================================================

test('ArraySchema.merge() returns the target runtime value when the source runtime value is omitted', t => {
	const target = [
		1,
		2,
	];

	t.deepEqual(
		Schema.array().merge(
			target,
			undefined,
		),
		target,
	);
});


test('ArraySchema.merge() returns the source runtime value when the target runtime value is omitted', t => {
	const source = [
		1,
		2,
	];

	t.deepEqual(
		Schema.array().merge(
			undefined,
			source,
		),
		source,
	);
});


test('ArraySchema.merge() throws ValidationError when the merged runtime value contains an invalid item', t => {
	assertValidationError(
		t,
		() => {
			Schema.array(Schema.number())
				.append()
				.merge(
					[1],
					['invalid'],
				);
		},
	);
});


test('ArraySchema.merge() throws ValidationError when the merged runtime value is omitted for a required schema', t => {
	assertValidationError(
		t,
		() => {
			Schema.array().merge(
				undefined,
				undefined,
			);
		},
	);
});



// =============================================================================
// Append Strategy
// =============================================================================

test('ArraySchema.merge() appends the source runtime value after the target runtime value', t => {
	t.deepEqual(
		Schema.array()
			.append()
			.merge(
				[
					1,
					2,
				],
				[
					3,
					4,
				],
			),
		[
			1,
			2,
			3,
			4,
		],
	);
});


test('ArraySchema.merge() preserves the relative order of the target runtime value when appending', t => {
	t.deepEqual(
		Schema.array()
			.append()
			.merge(
				[
					3,
					1,
					2,
				],
				[],
			),
		[
			3,
			1,
			2,
		],
	);
});


test('ArraySchema.merge() preserves the relative order of the source runtime value when appending', t => {
	t.deepEqual(
		Schema.array()
			.append()
			.merge(
				[],
				[
					3,
					1,
					2,
				],
			),
		[
			3,
			1,
			2,
		],
	);
});


test('ArraySchema.merge() appends the source runtime value to the configured default runtime value', t => {
	const schema = Schema.array()
		.default([
			1,
			2,
		])
		.append();

	const target = schema.applyDefaults(undefined);

	t.deepEqual(
		schema.merge(
			target,
			[
				3,
			],
		),
		[
			1,
			2,
			3,
		]);
});



// =============================================================================
// Prepend Strategy
// =============================================================================

test('ArraySchema.merge() prepends the source runtime value before the target runtime value', t => {
	t.deepEqual(
		Schema.array()
			.prepend()
			.merge(
				[
					3,
					4,
				],
				[
					1,
					2,
				],
			),
		[
			1,
			2,
			3,
			4,
		],
	);
});


test('ArraySchema.merge() preserves the relative order of the target runtime value when prepending', t => {
	t.deepEqual(
		Schema.array()
			.prepend()
			.merge(
				[
					3,
					1,
					2,
				],
				[],
			),
		[
			3,
			1,
			2,
		],
	);
});


test('ArraySchema.merge() preserves the relative order of the source runtime value when prepending', t => {
	t.deepEqual(
		Schema.array()
			.prepend()
			.merge(
				[],
				[
					3,
					1,
					2,
				],
			),
		[
			3,
			1,
			2,
		],
	);
});


test('ArraySchema.merge() prepends the source runtime value to the configured default runtime value', t => {
	const schema = Schema.array()
		.default([
			2,
			3,
		])
		.prepend();

	const target = schema.applyDefaults(undefined);

	t.deepEqual(
		schema.merge(
			target,
			[
				1,
			],
		),
		[
			1,
			2,
			3,
		]);
});



// =============================================================================
// Keyed Strategy
// =============================================================================

test('ArraySchema.merge() preserves unmatched target elements', t => {
	const schema = Schema.array()
		.items(createKeyedObjectSchema())
		.keyedBy('id');

	t.deepEqual(
		schema.merge(
			[
				{id: 1, name: 'Alice'},
				{id: 2, name: 'Bob'},
			],
			[
				{id: 1, name: 'Charlie'},
			],
		),
		[
			{id: 1, name: 'Charlie'},
			{id: 2, name: 'Bob'},
		],
	);
});


test('ArraySchema.merge() adds unmatched source elements', t => {
	const schema = Schema.array()
		.items(createKeyedObjectSchema())
		.keyedBy('id');

	t.deepEqual(
		schema.merge(
			[
				{id: 1, name: 'Alice'},
			],
			[
				{id: 2, name: 'Bob'},
			],
		),
		[
			{id: 1, name: 'Alice'},
			{id: 2, name: 'Bob'},
		],
	);
});


test('ArraySchema.merge() preserves the relative order of target elements', t => {
	const schema = Schema.array()
		.items(createKeyedObjectSchema())
		.keyedBy('id');

	t.deepEqual(
		schema.merge(
			[
				{id: 2, name: 'Bob'},
				{id: 1, name: 'Alice'},
			],
			[
				{id: 1, name: 'Charlie'},
			],
		),
		[
			{id: 2, name: 'Bob'},
			{id: 1, name: 'Charlie'},
		],
	);
});


test('ArraySchema.merge() preserves the relative order of inserted source elements', t => {
	const schema = Schema.array()
		.items(createKeyedObjectSchema())
		.keyedBy('id');

	t.deepEqual(
		schema.merge(
			[
				{id: 1, name: 'Alice'},
			],
			[
				{id: 2, name: 'Bob'},
				{id: 3, name: 'Charlie'},
			],
		),
		[
			{id: 1, name: 'Alice'},
			{id: 2, name: 'Bob'},
			{id: 3, name: 'Charlie'},
		],
	);
});


// Recursive Merge
// -----------------------------------------------------------------------------
test('ArraySchema.merge() replaces matched elements when no item schema is configured', t => {
	const schema = Schema.array()
		.keyedBy('id');

	t.deepEqual(
		schema.merge(
			[
				{id: 1, name: 'Alice'},
			],
			[
				{id: 1, name: 'Bob'},
			],
		),
		[
			{id: 1, name: 'Bob'},
		],
	);
});


test('ArraySchema.merge() merges matched elements using the configured item schema', t => {
	const schema = Schema.array()
		.items(
			Schema.object()
				.properties({
					id: Schema.number(),
					name: Schema.string(),
				}),
		)
		.keyedBy('id');

	t.deepEqual(
		schema.merge(
			[
				{
					id: 1,
					name: 'Alice',
				},
			],
			[
				{
					id: 1,
					name: 'Charlie',
				},
			],
		),
		[
			{
				id: 1,
				name: 'Charlie',
			},
		],
	);
});



// =============================================================================
// Strict Key Requirements
// =============================================================================

test('Keyed merge rejects a target item without the merge key', t => {
	const schema = Schema.array()
		.items(Schema.object())
		.keyedBy('id');

	assertTypeError(
		t,
		() => schema.merge(
			[
				{
					name: 'Alice',
				},
			],
			[],
		),
		'keyedBy("id") expects every item to have the merge key. Got the object `{"name": "Alice"}`.',
	);
});


test('Keyed merge rejects a source item without the merge key', t => {
	const schema = Schema.array()
		.items(Schema.object())
		.keyedBy('id');

	assertTypeError(
		t,
		() => schema.merge(
			[],
			[
				{
					name: 'Alice',
				},
			],
		),
		'keyedBy("id") expects every item to have the merge key. Got the object `{"name": "Alice"}`.',
	);
});


test('Keyed merge rejects duplicate target keys', t => {
	const schema = Schema.array()
		.items(Schema.object())
		.keyedBy('id');

	assertTypeError(
		t,
		() => schema.merge(
			[
				{id: 1},
				{id: 1},
			],
			[],
		),
	);
});


test('Keyed merge rejects duplicate source keys even when they match a target key', t => {
	const schema = Schema.array()
		.items(Schema.object())
		.keyedBy('id');

	assertTypeError(
		t,
		() => schema.merge(
			[
				{
					id: 1,
					name: 'Alice',
				},
			],
			[
				{
					id: 1,
					name: 'Bob',
				},
				{
					id: 1,
					name: 'Carol',
				},
			],
		),
	);
});


test('Keyed merge rejects a source item without the merge key when the target is omitted', t => {
	const schema = Schema.array()
		.items(Schema.object())
		.keyedBy('id');

	assertTypeError(
		t,
		() => schema.merge(
			undefined,
			[
				{
					name: 'Alice',
				},
			],
		),
	);
});



// =============================================================================
// Multiple Sources
// =============================================================================

test('ArraySchema.merge() appends multiple sources from left to right', t => {
	t.deepEqual(
		Schema.array(Schema.number())
			.append()
			.merge([1], [2], [3], [4]),
		[1, 2, 3, 4],
	);
});


test('ArraySchema.merge() prepends multiple sources from left to right', t => {
	t.deepEqual(
		Schema.array(Schema.number())
			.prepend()
			.merge([1], [2], [3], [4]),
		[4, 3, 2, 1],
	);
});


test('ArraySchema.merge() keyed merging updates stable positions and appends new items across multiple sources', t => {
	const schema = Schema.array(createKeyedObjectSchema())
		.keyedBy('id');

	t.deepEqual(
		schema.merge(
			[
				{id: 1, name: 'One'},
				{id: 2, name: 'Two'},
			],
			[
				{id: 2, name: 'Two A'},
				{id: 3, name: 'Three'},
			],
			[
				{id: 1, name: 'One B'},
				{id: 4, name: 'Four'},
			],
			[
				{id: 3, name: 'Three C'},
				{id: 5, name: 'Five'},
			],
		),
		[
			{id: 1, name: 'One B'},
			{id: 2, name: 'Two A'},
			{id: 3, name: 'Three C'},
			{id: 4, name: 'Four'},
			{id: 5, name: 'Five'},
		],
	);
});


test('ArraySchema.merge() keyed merging still rejects a missing key in a later source', t => {
	const schema = Schema.array(createKeyedObjectSchema())
		.keyedBy('id');

	assertTypeError(
		t,
		() => {
			schema.merge(
				[{id: 1, name: 'One'}],
				[{id: 2, name: 'Two'}],
				[{name: 'Missing'}],
			);
		},
	);
});


test('ArraySchema.merge() keyed merging still rejects duplicate keys in a later source', t => {
	const schema = Schema.array(createKeyedObjectSchema())
		.keyedBy('id');

	assertTypeError(
		t,
		() => {
			schema.merge(
				[{id: 1, name: 'One'}],
				[{id: 2, name: 'Two'}],
				[
					{id: 3, name: 'Three'},
					{id: 3, name: 'Duplicate'},
				],
			);
		},
	);
});


test('ArraySchema.merge() with one array argument treats it as one runtime value', t => {
	const value = [1, 2];

	t.is(
		Schema.array(Schema.number()).merge(value),
		value,
	);
});
