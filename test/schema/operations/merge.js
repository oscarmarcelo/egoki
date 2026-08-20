import test from 'ava';

import Schema from '../../../source/index.js';
import assertValidationError from '../../helpers/assert-validation-error.js';



// =============================================================================
// General Operation Semantics
// =============================================================================

test('merge() returns the target runtime value when the source runtime value is omitted', t => {
	const target = 'John';

	t.is(
		Schema.string().merge(
			target,
			undefined,
		),
		target,
	);
});


test('merge() returns the source runtime value when the target runtime value is omitted', t => {
	const source = 'John';

	t.is(
		Schema.string().merge(
			undefined,
			source,
		),
		source,
	);
});


test('merge() throws ValidationError when the merged runtime value is omitted for a required schema', t => {
	assertValidationError(
		t,
		() => {
			Schema.string().merge(
				undefined,
				undefined,
			);
		},
	);
});


test('merge() returns an omitted runtime value for an optional schema', t => {
	t.is(
		Schema.string().optional().merge(
			undefined,
			undefined,
		),
		undefined,
	);
});


test('merge() throws ValidationError when the merged runtime value is invalid', t => {
	assertValidationError(
		t,
		() => {
			Schema.string().merge(
				'Alice',
				123,
			);
		},
	);
});



// =============================================================================
// Replace Strategy
// =============================================================================

test('merge() replaces string runtime values with the source runtime value', t => {
	t.is(
		Schema.string().merge(
			'Alice',
			'Bob',
		),
		'Bob',
	);
});


test('merge() replaces number runtime values with the source runtime value', t => {
	t.is(
		Schema.number().merge(
			1,
			2,
		),
		2,
	);
});


test('merge() replaces boolean runtime values with the source runtime value', t => {
	t.false(
		Schema.boolean().merge(
			true,
			false,
		),
	);
});



// =============================================================================
// Multiple Sources
// =============================================================================

test('merge() merges multiple replacement sources from left to right', t => {
	t.is(
		Schema.string().merge(
			'target',
			'first',
			'second',
			'third',
		),
		'third',
	);
});


test('merge() ignores omitted sources while accumulating multiple sources', t => {
	t.is(
		Schema.string().merge(
			'target',
			undefined,
			'source',
		),
		'source',
	);
});



// =============================================================================
// Transactional Validation
// =============================================================================

test('merge() allows incomplete intermediate runtime values when the final result is valid', t => {
	const schema = Schema.object({
		first: Schema.string(),
		second: Schema.string(),
		third: Schema.string(),
		fourth: Schema.string(),
	});

	t.deepEqual(
		schema.merge(
			{first: 'first'},
			{second: 'second'},
			{third: 'third'},
			{fourth: 'fourth'},
		),
		{
			first: 'first',
			second: 'second',
			third: 'third',
			fourth: 'fourth',
		},
	);
});


test('merge() rejects a final runtime value that remains incomplete after multiple sources', t => {
	const schema = Schema.object({
		first: Schema.string(),
		second: Schema.string(),
		third: Schema.string(),
	});

	assertValidationError(
		t,
		() => {
			schema.merge(
				{first: 'first'},
				{second: 'second'},
			);
		},
	);
});



// =============================================================================
// Argument Count
// =============================================================================

test('merge() with one argument validates and returns the target runtime value', t => {
	const value = 'John';

	t.is(
		Schema.string().merge(value),
		value,
	);
});


test('merge() with no arguments validates an omitted runtime value', t => {
	assertValidationError(
		t,
		() => {
			Schema.string().merge();
		},
	);

	t.is(
		Schema.string().optional().merge(),
		undefined,
	);
});
