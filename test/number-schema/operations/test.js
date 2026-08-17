import test from 'ava';

import Schema from '../../../source/index.js';
import nonNumbers from '../../helpers/fixtures/non-numbers.js';
import label from '../../helpers/label.js';



// =============================================================================
// Runtime Type
// =============================================================================

test('NumberSchema.test() accepts a number runtime value', t => {
	t.true(
		Schema.number().test(42),
	);
});


for (const value of nonNumbers) {
	test(`NumberSchema.test() rejects ${label(value)} as a runtime value`, t => {
		t.false(
			Schema.number().test(value),
		);
	});
}



// =============================================================================
// Enumerations
// =============================================================================

test('NumberSchema.test() accepts a runtime value contained in the configured enum', t => {
	t.true(
		Schema.number()
			.enum([1, 2, 3])
			.test(2),
	);
});


test('NumberSchema.test() rejects a runtime value outside the configured enum', t => {
	t.false(
		Schema.number()
			.enum([1, 2, 3])
			.test(4),
	);
});
