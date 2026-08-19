import test from 'ava';

import Schema from '../../../source/index.js';



test('UnionSchema.test() returns true when a runtime value satisfies an alternative', t => {
	const schema = Schema.union([
		Schema.string(),
		Schema.number(),
	]);

	t.true(
		schema.test(42),
	);
});


test('UnionSchema.test() returns false when a runtime value satisfies no alternative', t => {
	const schema = Schema.union([
		Schema.string(),
		Schema.number(),
	]);

	t.false(
		schema.test(false),
	);
});
