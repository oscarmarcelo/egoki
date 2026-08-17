import test from 'ava';

import Schema from '../../../source/index.js';
import assertTypeError from '../../helpers/assert-type-error.js';
import nonSchemas from '../../helpers/fixtures/non-schemas.js';
import label from '../../helpers/label.js';



// =============================================================================
// Builder Contract
// =============================================================================

test('ArraySchema.items() returns a new schema instance', t => {
	const schema = Schema.array();

	t.not(
		schema.items(Schema.string()),
		schema,
	);
});


for (const value of nonSchemas) {
	test(`ArraySchema.items() rejects ${label(value)} as an item schema`, t => {
		assertTypeError(
			t,
			() => {
				Schema.array().items(value);
			},
		);
	});
}


test('ArraySchema.items() rejects a preserved default containing invalid items', t => {
	const schema = Schema.array().default([1]);

	assertTypeError(
		t,
		() => {
			schema.items(Schema.string());
		},
	);
});
