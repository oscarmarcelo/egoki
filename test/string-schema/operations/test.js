import test from 'ava';

import Schema from '../../../source/index.js';
import nonStrings from '../../helpers/fixtures/non-strings.js';
import label from '../../helpers/label.js';



// =============================================================================
// Runtime Type
// =============================================================================

test('StringSchema.test() accepts a string runtime value', t => {
	t.true(
		Schema.string().test('John'),
	);
});


for (const value of nonStrings) {
	test(`StringSchema.test() rejects ${label(value)} as a runtime value`, t => {
		t.false(
			Schema.string().test(value),
		);
	});
}
