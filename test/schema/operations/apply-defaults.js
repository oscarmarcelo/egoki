import test from 'ava';

import Schema from '../../../source/index.js';
import assertValidationError from '../../helpers/assert-validation-error.js';



// =============================================================================
// General Operation Semantics
// =============================================================================

test('applyDefaults() returns the supplied runtime value when no default is configured', t => {
	const value = 'John';

	t.is(
		Schema.string().applyDefaults(value),
		value,
	);
});


test('applyDefaults() returns the configured default value for an omitted runtime value', t => {
	t.is(
		Schema.string()
			.default('Anonymous')
			.applyDefaults(undefined),
		'Anonymous',
	);
});


test('applyDefaults() does not replace a defined runtime value', t => {
	t.is(
		Schema.string()
			.default('Anonymous')
			.applyDefaults('John'),
		'John',
	);
});



// =============================================================================
// Required / Optional
// =============================================================================

test('applyDefaults() applies configured defaults for required schemas', t => {
	t.is(
		Schema.string()
			.required()
			.default('Anonymous')
			.applyDefaults(undefined),
		'Anonymous',
	);
});


test('applyDefaults() returns omitted runtime values unchanged for optional schemas without defaults', t => {
	t.is(
		Schema.string()
			.optional()
			.applyDefaults(undefined),
		undefined,
	);
});



// =============================================================================
// Result Validation
// =============================================================================

test('applyDefaults() throws ValidationError when the resulting runtime value is invalid', t => {
	assertValidationError(
		t,
		() => {
			Schema.string()
				.applyDefaults(123);
		},
	);
});


test('applyDefaults() throws ValidationError when a required runtime value remains omitted', t => {
	assertValidationError(
		t,
		() => {
			Schema.string()
				.applyDefaults(undefined);
		},
	);
});


test('applyDefaults() throws ValidationError and does not replace null', t => {
	assertValidationError(
		t,
		() => {
			Schema.string()
				.default('Anonymous')
				.applyDefaults(null);
		},
	);
});
