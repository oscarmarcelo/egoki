import test from 'ava';

import Schema from '../../../source/index.js';
import assertValidationError from '../../helpers/assert-validation-error.js';
import nonArrays from '../../helpers/fixtures/non-arrays.js';
import label from '../../helpers/label.js';



// =============================================================================
// Runtime Type
// =============================================================================

test('ArraySchema.validate() accepts an array runtime value', t => {
	const value = [];

	t.is(
		Schema.array().validate(value),
		value,
	);
});


for (const value of nonArrays) {
	test(`ArraySchema.validate() rejects ${label(value)} as a runtime value`, t => {
		assertValidationError(
			t,
			() => {
				Schema.array().validate(value);
			},
		);
	});
}



// =============================================================================
// Configured Item Schema
// =============================================================================

test('ArraySchema.validate() validates every array item using the configured item schema', t => {
	const value = [
		'Alice',
		'Bob',
	];

	t.is(
		Schema.array()
			.items(Schema.string())
			.validate(value),
		value,
	);
});


test('ArraySchema.validate() rejects an array containing an invalid item', t => {
	assertValidationError(
		t,
		() => {
			Schema.array()
				.items(Schema.string())
				.validate([
					'Alice',
					123,
				]);
		},
	);
});


test('ArraySchema.validate() validates each array item', t => {
	const itemSchema = Schema.string();

	const schema = Schema.array()
		.items(itemSchema);

	const error = assertValidationError(
		t,
		() => {
			schema.validate([
				123,
			]);
		},
	);

	t.deepEqual(
		error.issues,
		[
			{
				message: 'Expected a string',
				path: [0],
				schema: itemSchema,
				value: 123,
			},
		],
	);
});



// =============================================================================
// Nested Validation
// =============================================================================

test('ArraySchema.validate() validates nested schemas recursively', t => {
	const value = [
		{
			name: 'Alice',
		},
	];

	t.is(
		Schema.array()
			.items(
				Schema.object().properties({
					name: Schema.string(), // eslint-disable-line unicorn/max-nested-calls
				}),
			)
			.validate(value),
		value,
	);
});


test('ArraySchema.validate() rejects invalid nested runtime values', t => {
	assertValidationError(
		t,
		() => {
			Schema.array()
				.items(
					Schema.object().properties({
						name: Schema.string(),
					}),
				)
				.validate([
					{
						name: 123,
					},
				]);
		},
	);
});
