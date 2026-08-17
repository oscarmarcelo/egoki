import test from 'ava';

import Schema from '../../../source/index.js';
import assertValidationError from '../../helpers/assert-validation-error.js';
import nonNumbers from '../../helpers/fixtures/non-numbers.js';
import label from '../../helpers/label.js';



// =============================================================================
// Runtime Type
// =============================================================================

test('NumberSchema.validate() accepts a number runtime value', t => {
	const value = 42;

	t.is(
		Schema.number().validate(value),
		value,
	);
});


for (const value of nonNumbers) {
	test(`NumberSchema.validate() rejects ${label(value)} as a runtime value`, t => {
		assertValidationError(
			t,
			() => {
				Schema.number().validate(value);
			},
		);
	});
}



// =============================================================================
// Enumerations
// =============================================================================

test('NumberSchema.validate() accepts a runtime value contained in the configured enum', t => {
	const value = 2;

	t.is(
		Schema.number()
			.enum([1, 2, 3])
			.validate(value),
		value,
	);
});


test('NumberSchema.validate() rejects a runtime value outside the configured enum', t => {
	assertValidationError(
		t,
		() => {
			Schema.number()
				.enum([1, 2, 3])
				.validate(4);
		},
	);
});
