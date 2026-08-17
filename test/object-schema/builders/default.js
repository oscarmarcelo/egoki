import test from 'ava';

import Schema from '../../../source/index.js';
import assertTypeError from '../../helpers/assert-type-error.js';



test('ObjectSchema.default() accepts plain objects that satisfy its property schemas', t => {
	t.notThrows(() => {
		Schema.object({
			name: Schema.string(),
		}).default({
			name: 'John',
		});
	});
});


test('ObjectSchema.default() rejects an invalid declared property', t => {
	assertTypeError(t, () => {
		Schema.object({
			name: Schema.string(),
		}).default({
			name: 42,
		});
	});
});


test('ObjectSchema.default() rejects an invalid additional property', t => {
	assertTypeError(t, () => {
		Schema.object()
			.additionalProperties(Schema.number())
			.default({
				count: 'one',
			});
	});
});
