import test from 'ava';

import Schema from '../../../source/index.js';
import assertTypeError from '../../helpers/assert-type-error.js';



// =============================================================================
// Builder Contract
// =============================================================================

test('ArraySchema.prepend() returns a new schema instance', t => {
	const schema = Schema.array();

	t.not(
		schema.prepend(),
		schema,
	);
});



// =============================================================================
// Preservation
// =============================================================================

test('ArraySchema.prepend() preserves every existing configuration option except the merge strategy', t => {
	const schema = Schema.array()
		.items(
			Schema.string(),
		)
		.default([
			'John',
		]);

	const target = schema.applyDefaults(undefined);

	const merged = schema
		.prepend()
		.merge(
			target,
			[
				'Jane',
			],
		);

	t.deepEqual(
		merged,
		[
			'Jane',
			'John',
		],
	);
});



// =============================================================================
//
// =============================================================================

test('Prepend merge returns the source when the target is undefined', t => {
	const schema = Schema.array().prepend();

	const source = [1, 2];

	t.is(
		schema.merge(undefined, source),
		source,
	);
});


test('Prepend merge returns the target when the source is undefined', t => {
	const schema = Schema.array().prepend();

	const target = [1, 2];

	t.is(
		schema.merge(target, undefined),
		target,
	);
});


test('Prepend merge throws when the target is not an array', t => {
	const schema = Schema.array().prepend();

	assertTypeError(
		t,
		() => {
			schema.merge(
				'target',
				[],
			);
		},
		'prepend() merge strategy expects the target to be an array. Got the string `target`.',
	);
});


test('Prepend merge throws when the source is not an array', t => {
	const schema = Schema.array().prepend();

	assertTypeError(
		t,
		() => {
			schema.merge(
				[],
				'source',
			);
		},
		'prepend() merge strategy expects the source to be an array. Got the string `source`.',
	);
});


test('Prepend merge concatenates arrays when no item schema is configured', t => {
	const schema = Schema.array().prepend();

	t.deepEqual(
		schema.merge(
			[3, 4],
			[1, 2],
		),
		[1, 2, 3, 4],
	);
});


test('Prepend merge applies the configured item schema to prepended items', t => {
	const schema = Schema.array()
		.items(
			Schema.object().deep(),
		)
		.prepend();

	t.deepEqual(
		schema.merge(
			[
				{
					right: 2,
				},
			],
			[
				{
					left: 1,
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
