import test from 'ava';

import Schema from '../../../source/index.js';
import assertTypeError from '../../helpers/assert-type-error.js';
import nonStrings from '../../helpers/fixtures/non-strings.js';
import label from '../../helpers/label.js';



// =============================================================================
// Builder Contract
// =============================================================================

test('ArraySchema.keyedBy() returns a new schema instance', t => {
	const schema = Schema.array();

	t.not(
		schema.keyedBy('id'),
		schema,
	);
});


for (const value of nonStrings) {
	test(`ArraySchema.keyedBy() rejects ${label(value)} as the merge key`, t => {
		assertTypeError(
			t,
			() => {
				Schema.array().keyedBy(value);
			},
		);
	});
}


test('ArraySchema.keyedBy() rejects an empty string as the merge key', t => {
	assertTypeError(
		t,
		() => {
			Schema.array().keyedBy('');
		},
	);
});



// =============================================================================
// Preservation
// =============================================================================

test('ArraySchema.keyedBy() preserves every existing configuration option except the merge modifier', t => {
	const schema = Schema.array()
		.items(
			Schema.object().properties({
				id: Schema.number(),
				name: Schema.string(),
			}),
		)
		.default([
			{
				id: 1,
				name: 'John',
			},
		]);

	const merged = schema
		.keyedBy('id')
		.merge(
			undefined,
			[
				{
					id: 1,
					name: 'Jane',
				},
			],
		);

	t.deepEqual(
		merged,
		[
			{
				id: 1,
				name: 'Jane',
			},
		],
	);
});



// =============================================================================
//
// =============================================================================

test('Keyed merge throws when the target is not an array', t => {
	const schema = Schema.array()
		.items(
			Schema.object(),
		)
		.keyedBy('id');

	assertTypeError(
		t,
		() => {
			schema.merge(
				'target',
				[],
			);
		},
		'keyedBy() merge strategy expects the target to be an array. Got the string `target`.',
	);
});


test('Keyed merge throws when the source is not an array', t => {
	const schema = Schema.array()
		.items(
			Schema.object(),
		)
		.keyedBy('id');

	assertTypeError(
		t,
		() => {
			schema.merge(
				[],
				'source',
			);
		},
		'keyedBy() merge strategy expects the source to be an array. Got the string `source`.',
	);
});


test('Keyed merge appends source items whose key does not exist in the target', t => {
	const schema = Schema.array()
		.items(
			Schema.object(),
		)
		.keyedBy('id');

	t.deepEqual(
		schema.merge(
			[
				{
					id: 1,
					name: 'John',
				},
			],
			[
				{
					id: 2,
					name: 'Jane',
				},
			],
		),
		[
			{
				id: 1,
				name: 'John',
			},
			{
				id: 2,
				name: 'Jane',
			},
		],
	);
});


test('Keyed merge merges source items whose key already exists in the target', t => {
	const schema = Schema.array()
		.items(
			Schema.object().deep(),
		)
		.keyedBy('id');

	t.deepEqual(
		schema.merge(
			[
				{
					id: 1,
					left: true,
				},
			],
			[
				{
					id: 1,
					right: true,
				},
			],
		),
		[
			{
				id: 1,
				left: true,
				right: true,
			},
		],
	);
});
