import test from 'ava';

import ValidationError from '../../source/errors/validation-error.js';
import assertTypeError from '../helpers/assert-type-error.js';



test('ValidationError stores the supplied issues', t => {
	const issues = [
		{
			path: [],
			message: 'Invalid value',
			value: 1,
		},
	];

	const error = new ValidationError(issues);

	t.is(error.name, 'ValidationError');
	t.true(error instanceof TypeError);
	t.deepEqual(error.issues, issues);
	t.not(error.issues, issues);
});


test('ValidationError.issue returns the first issue', t => {
	const issues = [
		{message: 'first'},
		{message: 'second'},
	];

	const error = new ValidationError(issues);

	t.is(error.issue, issues[0]);
});


test('ValidationError freezes the issues array', t => {
	const error = new ValidationError([
		{message: 'x'},
	]);

	t.true(Object.isFrozen(error.issues));
});


test('ValidationError rejects a non-array issues value', t => {
	assertTypeError(
		t,
		() => new ValidationError({}),
		'The property `issues` expects an array. Got the object `{}`.',
	);
});


test('ValidationError rejects an empty issues array', t => {
	assertTypeError(
		t,
		() => new ValidationError([]),
		'The property `issues` must contain at least one issue. Got the array `[]`.',
	);
});
