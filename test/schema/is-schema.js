import test from 'ava';

import Schema from '../../source/index.js';
import nonSchemas from '../helpers/fixtures/non-schemas.js';
import label from '../helpers/label.js';



test('Schema.isSchema() returns true for a StringSchema', t => {
	t.true(
		Schema.isSchema(
			Schema.string(),
		),
	);
});


test('Schema.isSchema() returns true for a NumberSchema', t => {
	t.true(
		Schema.isSchema(
			Schema.number(),
		),
	);
});


test('Schema.isSchema() returns true for a BooleanSchema', t => {
	t.true(
		Schema.isSchema(
			Schema.boolean(),
		),
	);
});


test('Schema.isSchema() returns true for an ArraySchema', t => {
	t.true(
		Schema.isSchema(
			Schema.array(
				Schema.string(), // eslint-disable-line unicorn/max-nested-calls
			),
		),
	);
});


test('Schema.isSchema() returns true for an ObjectSchema', t => {
	t.true(
		Schema.isSchema(
			Schema.object(),
		),
	);
});



test('Schema.isSchema() returns true for a UnionSchema', t => {
	const schema = Schema.union([
		Schema.string(),
	]);

	t.true(
		Schema.isSchema(schema),
	);
});


for (const value of nonSchemas) {
	test(`Schema.isSchema() returns false for ${label(value)}`, t => {
		t.false(
			Schema.isSchema(
				value,
			),
		);
	});
}


for (const value of nonSchemas) {
	test(`Schema.isSchema() never throws for ${label(value)}`, t => {
		t.notThrows(
			() => {
				Schema.isSchema(
					value,
				);
			},
		);
	});
}
