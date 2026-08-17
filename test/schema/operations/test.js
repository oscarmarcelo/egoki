import test from 'ava';

import Schema from '../../../source/index.js';



// =============================================================================
// General Operation Semantics
// =============================================================================

test('test() returns true when validation succeeds', t => {
	t.true(
		Schema.string().test('John'),
	);
});


test('test() returns false when validation fails', t => {
	t.false(
		Schema.string().test(123),
	);
});


test('test() never throws ValidationError', t => {
	t.notThrows(() => {
		Schema.string().test(123);
	});
});



// =============================================================================
// Required / Optional
// =============================================================================

test('test() accepts an omitted runtime value for an optional schema', t => {
	t.true(
		Schema.string()
			.optional()
			.test(undefined),
	);
});


test('test() rejects an omitted runtime value for a required schema', t => {
	t.false(
		Schema.string()
			.required()
			.test(undefined),
	);
});



// =============================================================================
// Primitive Runtime Types
// =============================================================================

// String
// -----------------------------------------------------------------------------
test('test() accepts a string runtime value', t => {
	t.true(
		Schema.string().test('John'),
	);
});


test('test() rejects a non-string runtime value', t => {
	t.false(
		Schema.string().test(123),
	);
});


// Number
// -----------------------------------------------------------------------------
test('test() accepts a number runtime value', t => {
	t.true(
		Schema.number().test(123),
	);
});


test('test() rejects a non-number runtime value', t => {
	t.false(
		Schema.number().test('John'),
	);
});


// Boolean
// -----------------------------------------------------------------------------
test('test() accepts a boolean runtime value', t => {
	t.true(
		Schema.boolean().test(true),
	);
});


test('test() rejects a non-boolean runtime value', t => {
	t.false(
		Schema.boolean().test('true'),
	);
});


// Array
// -----------------------------------------------------------------------------
test('test() accepts a valid array runtime value', t => {
	t.true(
		Schema.array().test([]),
	);
});


test('test() rejects a non-array runtime value', t => {
	t.false(
		Schema.array().test({}),
	);
});


// Object
// -----------------------------------------------------------------------------
test('test() accepts a valid object runtime value', t => {
	t.true(
		Schema.object().test({}),
	);
});


test('test() rejects a non-object runtime value', t => {
	t.false(
		Schema.object().test([]),
	);
});
