import test from 'ava';

import Schema from '../../../source/index.js';
import assertValidationError from '../../helpers/assert-validation-error.js';
import {createSinglePropertyObjectSchema} from '../../helpers/fixtures/create-schema.js';
import nonObjects from '../../helpers/fixtures/non-objects.js';
import label from '../../helpers/label.js';



// =============================================================================
// Runtime Type
// =============================================================================

test('ObjectSchema.validate() accepts an object runtime value', t => {
	const value = {};

	t.is(
		Schema.object().validate(value),
		value,
	);
});


for (const value of nonObjects) {
	test(`ObjectSchema.validate() rejects ${label(value)} as a runtime value`, t => {
		assertValidationError(
			t,
			() => {
				Schema.object().validate(value);
			},
		);
	});
}



// =============================================================================
// Configured Property Schemas
// =============================================================================

test('ObjectSchema.validate() validates every configured property', t => {
	const value = {
		name: 'Alice',
	};

	t.is(
		Schema.object().properties({
			name: Schema.string(),
		}).validate(value),
		value,
	);
});


test('ObjectSchema.validate() rejects an invalid configured property', t => {
	assertValidationError(
		t,
		() => {
			Schema.object().properties({
				name: Schema.string(),
			}).validate({
				name: 123,
			});
		},
	);
});



// =============================================================================
// Nested Validation
// =============================================================================

test('ObjectSchema.validate() validates nested schemas recursively', t => {
	const value = {
		child: {
			name: 'Alice',
		},
	};

	t.is(
		Schema.object().properties({
			child: createSinglePropertyObjectSchema(),
		}).validate(value),
		value,
	);
});


test('ObjectSchema.validate() rejects invalid nested runtime values', t => {
	assertValidationError(
		t,
		() => {
			Schema.object().properties({
				child: createSinglePropertyObjectSchema(),
			}).validate({
				child: {
					name: 123,
				},
			});
		},
	);
});



// =============================================================================
// Multiple Validation Issues
// =============================================================================

test('ObjectSchema.validate() continues validation after encountering a validation failure', t => {
	const error = assertValidationError(
		t,
		() => {
			Schema.object().properties({
				first: Schema.string(),
				second: Schema.number(),
			}).validate({
				first: 123,
				second: 'abc',
			});
		},
	);

	t.is(
		error.issues.length,
		2,
	);
});


test('ObjectSchema.validate() reports every discovered validation failure', t => {
	const error = assertValidationError(
		t,
		() => {
			Schema.object().properties({
				first: Schema.string(),
				second: Schema.number(),
			}).validate({
				first: 123,
				second: 'abc',
			});
		},
	);

	t.deepEqual(
		error.issues.map(issue => issue.path),
		[
			['first'],
			['second'],
		],
	);
});


test('ObjectSchema.validate() rejects objects with a custom prototype', t => {
	const prototype = {};
	const value = Object.create(prototype);

	assertValidationError(
		t,
		() => {
			Schema.object().validate(value);
		},
	);
});


test('ObjectSchema.validate() accepts null-prototype objects', t => {
	const value = Object.create(null);
	value.name = 'Alice';

	t.deepEqual(
		Schema.object({
			name: Schema.string(),
		}).validate(value),
		value,
	);
});
