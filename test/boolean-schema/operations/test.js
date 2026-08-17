import test from 'ava';

import Schema from '../../../source/index.js';
import nonBooleans from '../../helpers/fixtures/non-booleans.js';
import label from '../../helpers/label.js';



// =============================================================================
// Runtime Type
// =============================================================================

test('BooleanSchema.test() accepts a boolean runtime value', t => {
	t.true(
		Schema.boolean().test(true),
	);
});


for (const value of nonBooleans) {
	test(`BooleanSchema.test() rejects ${label(value)} as a runtime value`, t => {
		t.false(
			Schema.boolean().test(value),
		);
	});
}



// =============================================================================
// Enumerations
// =============================================================================

test('BooleanSchema.test() accepts a runtime value contained in the configured enum', t => {
	t.true(
		Schema.boolean()
			.enum([true])
			.test(true),
	);
});


test('BooleanSchema.test() rejects a runtime value outside the configured enum', t => {
	t.false(
		Schema.boolean()
			.enum([true])
			.test(false),
	);
});
