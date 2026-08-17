import test from 'ava';

import Schema from '../../../source/index.js';
import {createSinglePropertyObjectArraySchema} from '../../helpers/fixtures/create-schema.js';
import nonArrays from '../../helpers/fixtures/non-arrays.js';
import label from '../../helpers/label.js';



// =============================================================================
// Runtime Type
// =============================================================================

test('ArraySchema.test() accepts an array runtime value', t => {
	t.true(
		Schema.array().test([]),
	);
});


for (const value of nonArrays) {
	test(`ArraySchema.test() rejects ${label(value)} as a runtime value`, t => {
		t.false(
			Schema.array().test(value),
		);
	});
}



// =============================================================================
// Configured Item Schema
// =============================================================================

test('ArraySchema.test() accepts an array whose items satisfy the configured item schema', t => {
	t.true(
		Schema.array()
			.items(Schema.string())
			.test([
				'Alice',
				'Bob',
			]),
	);
});


test('ArraySchema.test() rejects an array containing an invalid item', t => {
	t.false(
		Schema.array()
			.items(Schema.string())
			.test([
				'Alice',
				123,
			]),
	);
});



// =============================================================================
// Nested Validation
// =============================================================================

test('ArraySchema.test() accepts arrays whose nested values satisfy the configured schemas', t => {
	t.true(
		createSinglePropertyObjectArraySchema().test([
			{
				name: 'Alice',
			},
		]),
	);
});


test('ArraySchema.test() rejects arrays whose nested values do not satisfy the configured schemas', t => {
	t.false(
		createSinglePropertyObjectArraySchema().test([
			{
				name: 123,
			},
		]),
	);
});
