import test from 'ava';

import Schema from '../../../source/index.js';
import assertTypeError from '../../helpers/assert-type-error.js';



test('UnionSchema.default() accepts a value satisfying any alternative', t => {
	const schema = Schema.union([
		Schema.string(),
		Schema.number(),
	]).default(42);

	t.is(
		schema.applyDefaults(undefined),
		42,
	);
});


test('UnionSchema.default() rejects a value satisfying no alternative', t => {
	const schema = Schema.union([
		Schema.string(),
		Schema.number(),
	]);

	assertTypeError(
		t,
		() => {
			schema.default(false);
		},
	);
});
