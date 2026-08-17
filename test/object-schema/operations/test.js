import test from 'ava';

import Schema from '../../../source/index.js';
import {createSinglePropertyObjectSchema} from '../../helpers/fixtures/create-schema.js';
import nonObjects from '../../helpers/fixtures/non-objects.js';
import label from '../../helpers/label.js';



// =============================================================================
// Runtime Type
// =============================================================================

test('ObjectSchema.test() accepts an object runtime value', t => {
	t.true(
		Schema.object().test({}),
	);
});


for (const value of nonObjects) {
	test(`ObjectSchema.test() rejects ${label(value)} as a runtime value`, t => {
		t.false(
			Schema.object().test(value),
		);
	});
}



// =============================================================================
// Configured Property Schemas
// =============================================================================

test('ObjectSchema.test() accepts runtime values that satisfy every configured property schema', t => {
	t.true(
		Schema.object().properties({
			name: Schema.string(),
		}).test({
			name: 'Alice',
		}),
	);
});


test('ObjectSchema.test() rejects runtime values that fail a configured property schema', t => {
	t.false(
		Schema.object().properties({
			name: Schema.string(),
		}).test({
			name: 123,
		}),
	);
});



// =============================================================================
// Nested Validation
// =============================================================================

test('ObjectSchema.test() accepts recursively valid runtime values', t => {
	t.true(
		Schema.object().properties({
			child: createSinglePropertyObjectSchema(),
		}).test({
			child: {
				name: 'Alice',
			},
		}),
	);
});


test('ObjectSchema.test() rejects recursively invalid runtime values', t => {
	t.false(
		Schema.object().properties({
			child: createSinglePropertyObjectSchema(),
		}).test({
			child: {
				name: 123,
			},
		}),
	);
});



// =============================================================================
// Multiple Validation Issues
// =============================================================================

test('ObjectSchema.test() returns false when validation fails', t => {
	t.false(
		Schema.object().properties({
			first: Schema.string(),
			second: Schema.number(),
		}).test({
			first: 123,
			second: 'abc',
		}),
	);
});
