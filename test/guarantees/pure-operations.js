import test from 'ava';

import Schema from '../../source/index.js';



// =============================================================================
// Validation
// =============================================================================

test('validate() does not modify the supplied runtime value', t => {
	const value = {
		name: 'Alice',
	};

	Schema.object().validate(value);

	t.deepEqual(
		value,
		{
			name: 'Alice',
		},
	);
});



// =============================================================================
// Default Application
// =============================================================================

test('applyDefaults() does not modify the supplied runtime value', t => {
	const value = {};

	Schema.object()
		.properties({
			name: Schema.string().default('Anonymous'),
		})
		.applyDefaults(value);

	t.deepEqual(
		value,
		{},
	);
});



// =============================================================================
// Merge
// =============================================================================

test('merge() does not modify the supplied runtime values', t => {
	const target = [
		1,
	];

	const source = [
		2,
	];

	Schema.array()
		.append()
		.merge(
			target,
			source,
		);

	t.deepEqual(
		target,
		[
			1,
		],
	);

	t.deepEqual(
		source,
		[
			2,
		],
	);
});
