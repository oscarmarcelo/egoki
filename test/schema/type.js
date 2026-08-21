import test from 'ava';

import Schema from '../../source/index.js';
import assertTypeError from '../helpers/assert-type-error.js';



for (const [type, schema] of [
	['string', Schema.string()],
	['number', Schema.number()],
	['boolean', Schema.boolean()],
	['array', Schema.array()],
	['object', Schema.object()],
	['union', Schema.union([Schema.string()])],
]) {
	test(`Schema type is ${type}`, t => {
		t.is(
			schema.type,
			type,
		);
	});
}



test('Schema type is read-only', t => {
	const schema = Schema.string();

	assertTypeError(
		t,
		() => {
			schema.type = 'number';
		},
	);

	t.is(
		schema.type,
		'string',
	);
});
