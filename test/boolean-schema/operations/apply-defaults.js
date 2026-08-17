import test from 'ava';

import Schema from '../../../source/index.js';



// =============================================================================
// Default Values
// =============================================================================

test('BooleanSchema.applyDefaults() returns the configured default value for an omitted runtime value', t => {
	t.true(
		Schema.boolean()
			.default(true)
			.applyDefaults(undefined),
	);
});



test('BooleanSchema.applyDefaults() returns the supplied runtime value when it is defined', t => {
	t.false(
		Schema.boolean()
			.default(true)
			.applyDefaults(false),
	);
});
