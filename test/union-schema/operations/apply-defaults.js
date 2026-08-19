import test from 'ava';

import Schema from '../../../source/index.js';
import assertValidationError from '../../helpers/assert-validation-error.js';



test('UnionSchema.applyDefaults() does not use alternative root defaults for an omitted union value', t => {
	const schema = Schema.union([
		Schema.string().default('text'),
		Schema.number().default(0),
	]).optional();

	t.is(
		schema.applyDefaults(undefined),
		undefined,
	);
});



test('UnionSchema.applyDefaults() rejects an omitted required value instead of using an alternative root default', t => {
	const schema = Schema.union([
		Schema.string().default('text'),
	]);

	assertValidationError(
		t,
		() => {
			schema.applyDefaults(undefined);
		},
	);
});


test('UnionSchema.applyDefaults() uses the union-level default for an omitted value', t => {
	const schema = Schema.union([
		Schema.string(),
		Schema.number(),
	]).default('text');

	t.is(
		schema.applyDefaults(undefined),
		'text',
	);
});


test('UnionSchema.applyDefaults() applies nested defaults through a matching alternative', t => {
	const objectAlternative = Schema.object({
		name: Schema.string().default('Anonymous'),
	});

	const schema = Schema.union([
		objectAlternative,
		Schema.string(),
	]);

	t.deepEqual(
		schema.applyDefaults({}),
		{
			name: 'Anonymous',
		},
	);
});


test('UnionSchema.applyDefaults() applies nested defaults to a union-level default', t => {
	const objectAlternative = Schema.object({
		name: Schema.string()
			.default('Anonymous')
			.optional(),
	});

	const schema = Schema.union([
		objectAlternative,
		Schema.string(),
	]).default({});

	t.deepEqual(
		schema.applyDefaults(undefined),
		{
			name: 'Anonymous',
		},
	);
});


test('UnionSchema.applyDefaults() selects the first alternative that can produce a valid value', t => {
	const first = Schema.object({
		name: Schema.string().default('first'),
	});

	const second = Schema.object({
		name: Schema.string().default('second'),
	});

	const schema = Schema.union([
		first,
		second,
	]);

	t.deepEqual(
		schema.applyDefaults({}),
		{
			name: 'first',
		},
	);
});


test('UnionSchema.applyDefaults() continues to later alternatives when an earlier result is invalid', t => {
	const invalid = Schema.object({
		count: Schema.number(),
	});

	const valid = Schema.object({
		name: Schema.string().default('Anonymous'),
	});

	const schema = Schema.union([
		invalid,
		valid,
	]);

	t.deepEqual(
		schema.applyDefaults({}),
		{
			name: 'Anonymous',
		},
	);
});


test('UnionSchema.applyDefaults() throws ValidationError when no alternative can produce a valid result', t => {
	const schema = Schema.union([
		Schema.string(),
		Schema.number(),
	]);

	assertValidationError(
		t,
		() => {
			schema.applyDefaults(false);
		},
	);
});



// =============================================================================
// Nested Usage
// =============================================================================

test('ObjectSchema does not obtain an omitted property default from a union alternative', t => {
	const union = Schema.union([
		Schema.string().default('text'),
	]).optional();

	const schema = Schema.object({
		value: union,
	});

	t.deepEqual(
		schema.applyDefaults({}),
		{},
	);
});


test('ObjectSchema applies a union-level default to an omitted property', t => {
	const union = Schema.union([
		Schema.string(),
		Schema.number(),
	]).default('text');

	const schema = Schema.object({
		value: union,
	});

	t.deepEqual(
		schema.applyDefaults({}),
		{
			value: 'text',
		},
	);
});


test('ArraySchema applies nested defaults through union item alternatives', t => {
	const objectAlternative = Schema.object({
		name: Schema.string().default('Anonymous'),
	});

	const union = Schema.union([
		objectAlternative,
		Schema.string(),
	]);

	const schema = Schema.array(union);

	t.deepEqual(
		schema.applyDefaults([
			{},
		]),
		[
			{
				name: 'Anonymous',
			},
		],
	);
});


test('ObjectSchema applies nested defaults through an additional-property union', t => {
	const objectAlternative = Schema.object({
		name: Schema.string().default('Anonymous'),
	});

	const union = Schema.union([
		objectAlternative,
		Schema.string(),
	]);

	const schema = Schema.object()
		.additionalProperties(union);

	t.deepEqual(
		schema.applyDefaults({
			user: {},
		}),
		{
			user: {
				name: 'Anonymous',
			},
		},
	);
});
