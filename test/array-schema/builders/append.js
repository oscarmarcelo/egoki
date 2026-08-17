import test from 'ava';

import Schema from '../../../source/index.js';
import assertTypeError from '../../helpers/assert-type-error.js';



// =============================================================================
// Builder Contract
// =============================================================================

test('ArraySchema.append() returns a new schema instance', t => {
	const schema = Schema.array();

	t.not(
		schema.append(),
		schema,
	);
});



// =============================================================================
// Preservation
// =============================================================================

test('ArraySchema.append() preserves every existing configuration option except the merge strategy', t => {
	const schema = Schema.array()
		.items(
			Schema.string(),
		)
		.default([
			'John',
		]);

	const target = schema.applyDefaults(undefined);

	const merged = schema
		.append()
		.merge(
			target,
			[
				'Jane',
			],
		);

	t.deepEqual(
		merged,
		[
			'John',
			'Jane',
		],
	);
});



// =============================================================================
//
// =============================================================================

test('Append merge returns the source when the target is undefined', t => {
	const schema = Schema.array().append();

	const source = [1, 2];

	t.is(
		schema.merge(undefined, source),
		source,
	);
});


test('Append merge returns the target when the source is undefined', t => {
	const schema = Schema.array().append();

	const target = [1, 2];

	t.is(
		schema.merge(target, undefined),
		target,
	);
});


test('Append merge throws when the target is not an array', t => {
	const schema = Schema.array().append();

	assertTypeError(
		t,
		() => {
			schema.merge(
				'target',
				[],
			);
		},
		'append() merge strategy expects the target to be an array. Got the string `target`.',
	);
});


test('Append merge throws when the source is not an array', t => {
	const schema = Schema.array().append();

	assertTypeError(
		t,
		() => {
			schema.merge(
				[],
				'source',
			);
		},
		'append() merge strategy expects the source to be an array. Got the string `source`.',
	);
});


test('Append merge concatenates arrays when no item schema is configured', t => {
	const schema = Schema.array().append();

	t.deepEqual(
		schema.merge(
			[1, 2],
			[3, 4],
		),
		[1, 2, 3, 4],
	);
});


test('Append merge applies the configured item schema to appended items', t => {
	const schema = Schema.array()
		.items(
			Schema.object().deep(),
		)
		.append();

	t.deepEqual(
		schema.merge(
			[
				{
					left: 1,
				},
			],
			[
				{
					right: 2,
				},
			],
		),
		[
			{
				left: 1,
			},
			{
				right: 2,
			},
		],
	);
});
