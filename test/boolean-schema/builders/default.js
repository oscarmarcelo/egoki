import test from 'ava';

import Schema from '../../../source/index.js';
import assertTypeError from '../../helpers/assert-type-error.js';
import nonBooleans from '../../helpers/fixtures/non-booleans.js';
import label from '../../helpers/label.js';



test('BooleanSchema.default() returns a new schema instance', t => {
	const schema = Schema.boolean();

	t.not(
		schema.default(true),
		schema,
	);
});


for (const value of nonBooleans) {
	test(`BooleanSchema.default() rejects ${label(value)} as a default value`, t => {
		assertTypeError(
			t,
			() => {
				Schema.boolean().default(value);
			},
		);
	});
}


test('BooleanSchema.default() rejects a value outside the configured enum', t => {
	assertTypeError(
		t,
		() => {
			Schema.boolean()
				.enum([true])
				.default(false);
		},
	);
});
