import test from 'ava';

import Schema from '../../source/index.js';



// =============================================================================
// Validation
// =============================================================================

test('validate() is deterministic', t => {
	const schema = Schema.string();

	t.is(
		schema.validate('John'),
		schema.validate('John'),
	);
});



// =============================================================================
// Testing
// =============================================================================

test('test() is deterministic', t => {
	const schema = Schema.number();

	t.is(
		schema.test(42),
		schema.test(42),
	);
});



// =============================================================================
// Default Application
// =============================================================================

test('applyDefaults() is deterministic', t => {
	const schema = Schema.string()
		.default('Anonymous');

	t.is(
		schema.applyDefaults(undefined),
		schema.applyDefaults(undefined),
	);
});



// =============================================================================
// Merge
// =============================================================================

test('merge() is deterministic', t => {
	const schema = Schema.array()
		.append();

	t.deepEqual(
		schema.merge([1], [2]),
		schema.merge([1], [2]),
	);
});
