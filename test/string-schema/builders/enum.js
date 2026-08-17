import test from 'ava';

import Schema from '../../../source/index.js';
import assertTypeError from '../../helpers/assert-type-error.js';
import nonArrays from '../../helpers/fixtures/non-arrays.js';
import nonStrings from '../../helpers/fixtures/non-strings.js';
import label from '../../helpers/label.js';



test('StringSchema.enum() returns a new schema instance', t => {
	const schema = Schema.string();

	t.not(
		schema.enum(['value']),
		schema,
	);
});


for (const value of nonArrays) {
	test(`StringSchema.enum() rejects ${label(value)} as the enum`, t => {
		assertTypeError(
			t,
			() => {
				Schema.string().enum(value);
			},
		);
	});
}


test('StringSchema.enum() rejects an empty array', t => {
	assertTypeError(
		t,
		() => {
			Schema.string().enum([]);
		},
	);
});


for (const value of nonStrings) {
	test(`StringSchema.enum() rejects ${label(value)} as an enum value`, t => {
		assertTypeError(
			t,
			() => {
				Schema.string().enum([value]);
			},
		);
	});
}


test('StringSchema.enum() identifies enum() in primitive type errors', t => {
	assertTypeError(
		t,
		() => {
			Schema.string().enum([1]);
		},
		'enum() expects a string. Got the number `1`.',
	);
});


test('StringSchema.enum() rejects duplicate values', t => {
	assertTypeError(
		t,
		() => {
			Schema.string().enum([
				'red',
				'red',
			]);
		},
	);
});


test('StringSchema.enum() rejects an enum that excludes the configured default value', t => {
	assertTypeError(
		t,
		() => {
			Schema.string()
				.default('red')
				.enum([
					'green',
					'blue',
				]);
		},
	);
});
