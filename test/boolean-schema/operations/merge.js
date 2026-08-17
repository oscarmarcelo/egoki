import test from 'ava';

import Schema from '../../../source/index.js';



// =============================================================================
// Replace Strategy
// =============================================================================

test('BooleanSchema.merge() replaces the target runtime value with the source runtime value', t => {
	t.false(
		Schema.boolean().merge(
			true,
			false,
		),
	);
});
