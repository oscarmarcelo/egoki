import test from 'ava';

import Schema from '../../../source/index.js';



// =============================================================================
// Default Values
// =============================================================================

test('StringSchema.applyDefaults() returns the configured default value for an omitted runtime value', t => {
	t.is(
		Schema.string()
			.default('Anonymous')
			.applyDefaults(undefined),
		'Anonymous',
	);
});


test('StringSchema.applyDefaults() returns the supplied runtime value when it is defined', t => {
	t.is(
		Schema.string()
			.default('Anonymous')
			.applyDefaults('John'),
		'John',
	);
});
