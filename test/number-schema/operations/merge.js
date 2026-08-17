import test from 'ava';

import Schema from '../../../source/index.js';



// =============================================================================
// Replace Strategy
// =============================================================================

test('NumberSchema.merge() replaces the target runtime value with the source runtime value', t => {
	t.is(
		Schema.number().merge(
			1,
			2,
		),
		2,
	);
});
