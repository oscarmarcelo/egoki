import test from 'ava';

import Schema from '../../../source/index.js';
import assertTypeError from '../../helpers/assert-type-error.js';
import nonStrings from '../../helpers/fixtures/non-strings.js';
import label from '../../helpers/label.js';



test('StringSchema.default() returns a new schema instance', t => {
	const schema = Schema.string();

	t.not(
		schema.default('Anonymous'),
		schema,
	);
});


for (const value of nonStrings) {
	test(`StringSchema.default() rejects ${label(value)} as a default value`, t => {
		assertTypeError(
			t,
			() => {
				Schema.string().default(value);
			},
		);
	});
}


test('StringSchema.default() rejects a value outside the configured enum', t => {
	assertTypeError(
		t,
		() => {
			Schema.string()
				.enum(['red', 'green', 'blue'])
				.default('yellow');
		},
	);
});
