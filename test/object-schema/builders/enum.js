import test from 'ava';

import Schema from '../../../source/index.js';



test('ObjectSchema does not expose enum()', t => {
	t.is(
		Schema.object().enum,
		undefined,
	);
});
