import test from 'ava';

import Schema from '../../../source/index.js';
import assertTypeError from '../../helpers/assert-type-error.js';
import nonArrays from '../../helpers/fixtures/non-arrays.js';
import nonBooleans from '../../helpers/fixtures/non-booleans.js';
import label from '../../helpers/label.js';



test('BooleanSchema.enum() returns a new schema instance', t => {
	const schema = Schema.boolean();

	t.not(
		schema.enum([true]),
		schema,
	);
});


for (const value of nonArrays) {
	test(`BooleanSchema.enum() rejects ${label(value)} as the enum`, t => {
		assertTypeError(
			t,
			() => {
				Schema.boolean().enum(value);
			},
		);
	});
}


test('BooleanSchema.enum() rejects an empty array', t => {
	assertTypeError(
		t,
		() => {
			Schema.boolean().enum([]);
		},
	);
});


for (const value of nonBooleans) {
	test(`BooleanSchema.enum() rejects ${label(value)} as an enum value`, t => {
		assertTypeError(
			t,
			() => {
				Schema.boolean().enum([value]);
			},
		);
	});
}


test('BooleanSchema.enum() rejects duplicate values', t => {
	assertTypeError(
		t,
		() => {
			Schema.boolean().enum([
				true,
				true,
			]);
		},
	);
});


test('BooleanSchema.enum() rejects an enum that excludes the configured default value', t => {
	assertTypeError(
		t,
		() => {
			Schema.boolean()
				.default(true)
				.enum([
					false,
				]);
		},
	);
});
