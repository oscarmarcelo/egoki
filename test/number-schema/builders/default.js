import test from 'ava';

import Schema from '../../../source/index.js';
import assertTypeError from '../../helpers/assert-type-error.js';
import nonNumbers from '../../helpers/fixtures/non-numbers.js';
import label from '../../helpers/label.js';



test('NumberSchema.default() returns a new schema instance', t => {
	const schema = Schema.number();

	t.not(
		schema.default(0),
		schema,
	);
});


for (const value of nonNumbers) {
	test(`NumberSchema.default() rejects ${label(value)} as a default value`, t => {
		assertTypeError(
			t,
			() => {
				Schema.number().default(value);
			},
		);
	});
}


test('NumberSchema.default() rejects a value outside the configured enum', t => {
	assertTypeError(
		t,
		() => {
			Schema.number()
				.enum([1, 2, 3])
				.default(4);
		},
	);
});
