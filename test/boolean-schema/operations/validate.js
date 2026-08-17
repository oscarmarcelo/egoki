import test from 'ava';

import Schema from '../../../source/index.js';
import assertValidationError from '../../helpers/assert-validation-error.js';



// =============================================================================
// Enumerations
// =============================================================================

test('BooleanSchema.validate() accepts a runtime value contained in the configured enum', t => {
	const value = true; // eslint-disable-line unicorn/consistent-boolean-name

	t.is(
		Schema.boolean()
			.enum([true])
			.validate(value),
		value,
	);
});


test('BooleanSchema.validate() rejects a runtime value outside the configured enum', t => {
	assertValidationError(
		t,
		() => {
			Schema.boolean()
				.enum([true])
				.validate(false);
		},
	);
});
