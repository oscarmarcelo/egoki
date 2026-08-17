import test from 'ava';

import ValidationError from '../../source/errors/validation-error.js';
import Schema from '../../source/index.js';
import assertValidationError from '../helpers/assert-validation-error.js';



// =============================================================================
// Error Type
// =============================================================================

test('validate() throws a ValidationError that extends Error', t => {
	const error = assertValidationError(
		t,
		() => {
			Schema.string().validate(123);
		},
	);

	t.true(
		error instanceof Error,
	);

	t.true(
		error instanceof ValidationError,
	);
});


test('ValidationError.message summarizes a single validation issue', t => {
	const error = assertValidationError(
		t,
		() => {
			Schema.string().validate(123);
		},
	);

	t.is(
		error.message,
		'Validation failed with 1 issue.',
	);
});


test('ValidationError.message summarizes multiple validation issues', t => {
	const error = assertValidationError(
		t,
		() => {
			Schema.object().properties({
				first: Schema.string(),
				second: Schema.number(),
			}).validate({
				first: 123,
				second: 'abc',
			});
		},
	);

	t.is(
		error.message,
		'Validation failed with 2 issues.',
	);
});


test('ValidationError exposes an issues array', t => {
	const error = assertValidationError(
		t,
		() => {
			Schema.string().validate(123);
		},
	);

	t.true(
		Array.isArray(error.issues),
	);
});


test('ValidationError.issues contains at least one validation issue', t => {
	const error = assertValidationError(
		t,
		() => {
			Schema.string().validate(123);
		},
	);

	t.true(
		error.issues.length > 0,
	);
});


test('ValidationError issues expose a message', t => {
	const error = assertValidationError(
		t,
		() => {
			Schema.string().validate(123);
		},
	);

	const issue = error.issues[0];

	t.is(
		typeof issue.message,
		'string',
	);
});


test('ValidationError issues expose a path', t => {
	const error = assertValidationError(
		t,
		() => {
			Schema.string().validate(123);
		},
	);

	const issue = error.issues[0];

	t.true(
		Array.isArray(issue.path),
	);
});


test('ValidationError issues expose the failing runtime value', t => {
	const value = 123;

	const error = assertValidationError(
		t,
		() => {
			Schema.string().validate(value);
		},
	);

	const issue = error.issues[0];

	t.is(
		issue.value,
		value,
	);
});


test('ValidationError contains one issue for each validation failure', t => {
	const error = assertValidationError(
		t,
		() => {
			Schema.object().properties({
				first: Schema.string(),
				second: Schema.number(),
			}).validate({
				first: 123,
				second: 'abc',
			});
		},
	);

	const {issues} = error;

	t.is(
		issues.length,
		2,
	);
});


test('ValidationError preserves the order in which validation issues were discovered', t => {
	const error = assertValidationError(
		t,
		() => {
			Schema.object().properties({
				first: Schema.string(),
				second: Schema.number(),
			}).validate({
				first: 123,
				second: 'abc',
			});
		},
	);

	t.deepEqual(
		error.issues.map(issue => issue.path),
		[
			['first'],
			['second'],
		],
	);
});


test('ValidationError issues expose human-readable messages', t => {
	const error = assertValidationError(
		t,
		() => {
			Schema.string().validate(123);
		},
	);

	for (const issue of error.issues) {
		t.is(typeof issue.message, 'string');
		t.true(issue.message.length > 0);
	}
});
