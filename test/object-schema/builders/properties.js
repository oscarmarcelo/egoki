import test from 'ava';

import Schema from '../../../source/index.js';
import assertTypeError from '../../helpers/assert-type-error.js';
import nonObjects from '../../helpers/fixtures/non-objects.js';
import nonSchemas from '../../helpers/fixtures/non-schemas.js';
import label from '../../helpers/label.js';



test('ObjectSchema.properties() returns a new schema instance', t => {
	const schema = Schema.object();

	t.not(
		schema.properties({}),
		schema,
	);
});


test('ObjectSchema.properties() accepts an empty property map', t => {
	t.notThrows(() => {
		Schema.object().properties({});
	});
});


for (const value of nonObjects) {
	test(`ObjectSchema.properties() rejects ${label(value)} as the properties object`, t => {
		assertTypeError(
			t,
			() => {
				Schema.object().properties(value);
			},
		);
	});
}


for (const value of nonSchemas) {
	test(`ObjectSchema.properties() rejects ${label(value)} as a property schema`, t => {
		assertTypeError(
			t,
			() => {
				Schema.object().properties({
					name: value,
				});
			},
		);
	});
}


test('ObjectSchema.properties() rejects a preserved default that no longer satisfies the properties', t => {
	const schema = Schema.object().default({});

	assertTypeError(
		t,
		() => {
			schema.properties({
				name: Schema.string(),
			});
		},
	);
});
