import test from 'ava';

import schemas from '../../helpers/fixtures/schemas.js';



for (const [name, createSchema] of Object.entries(schemas)) {
	test(`${name}.replace() returns a new schema instance`, t => {
		const schema = createSchema();

		t.not(
			schema.replace(),
			schema,
		);
	});
}
