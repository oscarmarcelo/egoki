import test from 'ava';

import schemas from '../../helpers/fixtures/schemas.js';



for (const [name, createSchema] of Object.entries(schemas)) {
	test(`${name}.optional() returns a new schema instance`, t => {
		const schema = createSchema();

		t.not(
			schema.optional(),
			schema,
		);
	});
}


for (const [name, createSchema] of Object.entries(schemas)) {
	test(`${name}.optional() is equivalent to required(false)`, t => {
		const schema = createSchema();

		t.deepEqual(
			schema.optional(),
			schema.required(false),
		);
	});
}

for (const [name, createSchema] of Object.entries(schemas)) {
	test(`${name}.optional() overrides the default required configuration`, t => {
		const schema = createSchema();

		t.notThrows(() => {
			schema.optional().validate(undefined);
		});
	});
}
