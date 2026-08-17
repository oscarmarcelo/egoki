import test from 'ava';

import Schema from '../../../source/index.js';
import assertTypeError from '../../helpers/assert-type-error.js';
import nonArrays from '../../helpers/fixtures/non-arrays.js';
import nonNumbers from '../../helpers/fixtures/non-numbers.js';
import label from '../../helpers/label.js';



test('NumberSchema.enum() returns a new schema instance', t => {
	const schema = Schema.number();

	t.not(
		schema.enum([1]),
		schema,
	);
});


for (const value of nonArrays) {
	test(`NumberSchema.enum() rejects ${label(value)} as the enum`, t => {
		assertTypeError(
			t,
			() => {
				Schema.number().enum(value);
			},
		);
	});
}


test('NumberSchema.enum() rejects an empty array', t => {
	assertTypeError(
		t,
		() => {
			Schema.number().enum([]);
		},
	);
});


for (const value of nonNumbers) {
	test(`NumberSchema.enum() rejects ${label(value)} as an enum value`, t => {
		assertTypeError(
			t,
			() => {
				Schema.number().enum([value]);
			},
		);
	});
}


test('NumberSchema.enum() rejects duplicate values', t => {
	assertTypeError(
		t,
		() => {
			Schema.number().enum([
				1,
				1,
			]);
		},
	);
});


test('NumberSchema.enum() rejects an enum that excludes the configured default value', t => {
	assertTypeError(
		t,
		() => {
			Schema.number()
				.default(1)
				.enum([
					2,
					3,
				]);
		},
	);
});
