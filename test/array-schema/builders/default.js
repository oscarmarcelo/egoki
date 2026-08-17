import test from 'ava';

import Schema from '../../../source/index.js';
import assertTypeError from '../../helpers/assert-type-error.js';



test('ArraySchema.default() accepts values that satisfy the item schema', t => {
	t.notThrows(() => {
		Schema.array(Schema.number()).default([1, 2]);
	});
});


test('ArraySchema.default() rejects an invalid item', t => {
	assertTypeError(t, () => {
		Schema.array(Schema.number()).default([1, 'two']);
	});
});


test('ArraySchema.default() returns a new schema instance', t => {
	const schema = Schema.array();

	t.not(
		schema.default([]),
		schema,
	);
});
