import test from 'ava';

import assertTypeError from '../../helpers/assert-type-error.js';
import assertValidationError from '../../helpers/assert-validation-error.js';
import nonBooleans from '../../helpers/fixtures/non-booleans.js';
import schemas from '../../helpers/fixtures/schemas.js';
import label from '../../helpers/label.js';



for (const [name, createSchema] of Object.entries(schemas)) {
	test(`${name}.required() returns a new schema instance`, t => {
		const schema = createSchema();

		t.not(
			schema.required(),
			schema,
		);
	});
}


for (const [name, createSchema] of Object.entries(schemas)) {
	test(`${name}.required() is equivalent to required(true)`, t => {
		const schema = createSchema();

		t.deepEqual(
			schema.required(),
			schema.required(true),
		);
	});
}

for (const [name, createSchema] of Object.entries(schemas)) {
	test(`${name} schema is required by default`, t => {
		const schema = createSchema();

		assertValidationError(
			t,
			() => schema.validate(undefined),
		);
	});
}


for (const [name, createSchema] of Object.entries(schemas)) {
	for (const value of nonBooleans) {
		test(`${name}.required() rejects ${label(value)} as the required flag`, t => {
			const schema = createSchema();

			assertTypeError(
				t,
				() => {
					schema.required(value);
				},
			);
		});
	}
}
