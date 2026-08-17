import test from 'ava';

import Schema from '../../../source/index.js';
import assertValidationError from '../../helpers/assert-validation-error.js';
import nonStrings from '../../helpers/fixtures/non-strings.js';
import label from '../../helpers/label.js';



// =============================================================================
// Runtime Type
// =============================================================================

test('StringSchema.validate() accepts a string runtime value', t => {
	const value = 'John';

	t.is(
		Schema.string().validate(value),
		value,
	);
});


for (const value of nonStrings) {
	test(`StringSchema.validate() rejects ${label(value)} as a runtime value`, t => {
		assertValidationError(
			t,
			() => {
				Schema.string().validate(value);
			},
		);
	});
}



// =============================================================================
// Enumerations
// =============================================================================

test('StringSchema.validate() accepts a runtime value contained in the configured enum', t => {
	const value = 'green';

	t.is(
		Schema.string()
			.enum(['red', 'green', 'blue'])
			.validate(value),
		value,
	);
});


test('StringSchema.validate() rejects a runtime value outside the configured enum', t => {
	assertValidationError(
		t,
		() => {
			Schema.string()
				.enum(['red', 'green', 'blue'])
				.validate('yellow');
		},
	);
});
