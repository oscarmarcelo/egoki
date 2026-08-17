import test from 'ava';

import Schema from '../../../source/index.js';



// =============================================================================
// Replace Strategy
// =============================================================================

test('StringSchema.merge() replaces the target runtime value with the source runtime value', t => {
	t.is(
		Schema.string().merge(
			'Alice',
			'Bob',
		),
		'Bob',
	);
});
