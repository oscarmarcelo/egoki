import test from 'ava';

import Schema from '../../../source/index.js';



// =============================================================================
// Default Values
// =============================================================================

test('NumberSchema.applyDefaults() returns the configured default value for an omitted runtime value', t => {
	t.is(
		Schema.number()
			.default(0)
			.applyDefaults(undefined),
		0,
	);
});



test('NumberSchema.applyDefaults() returns the supplied runtime value when it is defined', t => {
	t.is(
		Schema.number()
			.default(0)
			.applyDefaults(42),
		42,
	);
});
