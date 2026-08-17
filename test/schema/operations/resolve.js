import test from 'ava';

import Schema from '../../../source/index.js';
import assertValidationError from '../../helpers/assert-validation-error.js';



// =============================================================================
// Validation
// =============================================================================

test('resolve() validates the resolved target runtime value', t => {
	const schema = Schema.string()
		.default('John');

	t.notThrows(() => {
		schema.resolve(undefined, 'Jane');
	});
});


test('resolve() rejects an invalid source runtime value', t => {
	const schema = Schema.string();

	assertValidationError(t, () => {
		schema.resolve(
			'John',
			123,
		);
	});
});



// =============================================================================
// Composition
// =============================================================================

test('resolve() behaves equivalently to the underlying schema operations', t => {
	const schema = Schema.array()
		.default([
			1,
			2,
		])
		.append();

	const target = undefined;

	const source = [
		3,
	];

	const defaults = schema.applyDefaults(target);

	const merged = schema.merge(
		defaults,
		source,
	);

	const expected = schema.validate(merged);

	t.deepEqual(
		schema.resolve(
			target,
			source,
		),
		expected,
	);
});
