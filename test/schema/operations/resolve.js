import test from 'ava';

import Schema from '../../../source/index.js';
import assertValidationError from '../../helpers/assert-validation-error.js';



// =============================================================================
// Validation
// =============================================================================

test('resolve() validates the final resolved runtime value', t => {
	const schema = Schema.string()
		.default('John');

	t.notThrows(() => {
		schema.resolve(undefined, 'Jane');
	});
});


test('resolve() rejects an invalid final source runtime value', t => {
	const schema = Schema.string();

	assertValidationError(t, () => {
		schema.resolve(
			'John',
			123,
		);
	});
});


test('resolve() allows an incomplete target to be completed before final validation', t => {
	const schema = Schema.object({
		format: Schema.string(),
		quality: Schema.number().default(80),
	});

	t.deepEqual(
		schema.resolve(
			{quality: 70},
			{format: 'webp'},
		),
		{
			format: 'webp',
			quality: 70,
		},
	);
});


test('resolve() allows required properties to be distributed across multiple fragments', t => {
	const schema = Schema.object({
		first: Schema.string(),
		second: Schema.string(),
		third: Schema.string(),
		fourth: Schema.string(),
	});

	t.deepEqual(
		schema.resolve(
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


test('resolve() rejects an invalid final result after multiple incomplete fragments', t => {
	const schema = Schema.object({
		first: Schema.string(),
		second: Schema.string(),
		third: Schema.string(),
	});

	assertValidationError(
		t,
		() => {
			schema.resolve(
				{first: 'first'},
				{second: 'second'},
			);
		},
	);
});



// =============================================================================
// Precedence
// =============================================================================

test('resolve() merges multiple sources from left to right', t => {
	const schema = Schema.object({
		value: Schema.string(),
	});

	t.deepEqual(
		schema.resolve(
			{value: 'target'},
			{value: 'first'},
			{value: 'second'},
		),
		{value: 'second'},
	);
});


test('resolve() ignores omitted sources while accumulating values', t => {
	t.is(
		Schema.string().resolve(
			'target',
			undefined,
			'source',
		),
		'source',
	);
});



// =============================================================================
// Argument Count
// =============================================================================

test('resolve() with one argument applies defaults and validates the target', t => {
	const schema = Schema.object({
		name: Schema.string().default('John'),
	});

	t.deepEqual(
		schema.resolve({}),
		{name: 'John'},
	);
});


test('resolve() with no arguments uses a root default when configured', t => {
	t.is(
		Schema.string().default('John').resolve(),
		'John',
	);
});


test('resolve() with no arguments follows required and optional validation semantics without a root default', t => {
	assertValidationError(
		t,
		() => {
			Schema.string().resolve();
		},
	);

	t.is(
		Schema.string().optional().resolve(),
		undefined,
	);
});



// =============================================================================
// Explicit Values
// =============================================================================

test('resolve() does not replace an explicit null source with a configured default', t => {
	const schema = Schema.string().default('default');
	const error = assertValidationError(
		t,
		() => {
			schema.resolve(undefined, null);
		},
	);

	t.deepEqual(
		error.issues,
		[
			{
				schema,
				path: [],
				value: null,
				message: 'Expected a string',
			},
		],
	);
});
