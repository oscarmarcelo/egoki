import test from 'ava';

import Schema from '../../../source/index.js';
import assertValidationError from '../../helpers/assert-validation-error.js';



test('UnionSchema.validate() accepts a runtime value satisfying the first alternative', t => {
	const schema = Schema.union([
		Schema.string(),
		Schema.number(),
	]);

	const value = 'text';

	t.is(
		schema.validate(value),
		value,
	);
});


test('UnionSchema.validate() accepts a runtime value satisfying a later alternative', t => {
	const schema = Schema.union([
		Schema.string(),
		Schema.number(),
	]);

	const value = 42;

	t.is(
		schema.validate(value),
		value,
	);
});


test('UnionSchema.validate() uses inclusive OR semantics for overlapping alternatives', t => {
	const schema = Schema.union([
		Schema.string(),
		Schema.string().enum(['auto']),
	]);

	const value = 'auto';

	t.is(
		schema.validate(value),
		value,
	);
});


test('UnionSchema.validate() rejects a runtime value satisfying no alternative', t => {
	const schema = Schema.union([
		Schema.string(),
		Schema.number(),
	]);

	assertValidationError(
		t,
		() => {
			schema.validate(false);
		},
	);
});


test('UnionSchema.validate() reports one union issue when every alternative rejects the value', t => {
	const objectAlternative = Schema.object({
		name: Schema.string(),
		age: Schema.number(),
	});

	const schema = Schema.union([
		objectAlternative,
		Schema.array(Schema.number()),
	]);

	const value = {
		name: 123,
		age: 'old',
	};

	const error = assertValidationError(
		t,
		() => {
			schema.validate(value);
		},
	);

	t.deepEqual(
		error.issues,
		[
			{
				message: 'Expected a value satisfying at least one schema',
				path: [],
				schema,
				value,
			},
		],
	);
});


test('UnionSchema.validate() reports the containing path for a union failure', t => {
	const union = Schema.union([
		Schema.string(),
		Schema.number(),
	]);

	const schema = Schema.object({
		value: union,
	});

	const error = assertValidationError(
		t,
		() => {
			schema.validate({
				value: false,
			});
		},
	);

	t.deepEqual(
		error.issues,
		[
			{
				message: 'Expected a value satisfying at least one schema',
				path: ['value'],
				schema: union,
				value: false,
			},
		],
	);
});


test('UnionSchema.validate() does not use an optional alternative to make the union optional', t => {
	const schema = Schema.union([
		Schema.string().optional(),
		Schema.number(),
	]);

	assertValidationError(
		t,
		() => {
			schema.validate(undefined);
		},
	);
});


test('UnionSchema.validate() accepts an omitted value when the union is optional', t => {
	const schema = Schema.union([
		Schema.string(),
		Schema.number(),
	]).optional();

	t.is(
		schema.validate(undefined),
		undefined,
	);
});


test('UnionSchema validates through a single configured alternative', t => {
	const schema = Schema.union([
		Schema.string(),
	]);

	t.true(
		schema.test('text'),
	);

	t.false(
		schema.test(42),
	);
});



// =============================================================================
// Nested Usage
// =============================================================================

test('ArraySchema validates mixed items through a union item schema', t => {
	const union = Schema.union([
		Schema.string(),
		Schema.number(),
	]);

	const schema = Schema.array(union);
	const value = [
		'text',
		42,
	];

	t.is(
		schema.validate(value),
		value,
	);
});


test('ArraySchema reports the item path when a union item rejects a value', t => {
	const union = Schema.union([
		Schema.string(),
		Schema.number(),
	]);

	const schema = Schema.array(union);

	const error = assertValidationError(
		t,
		() => {
			schema.validate([
				'text',
				false,
			]);
		},
	);

	t.like(error.issues, [
		{
			path: [1],
			schema: union,
		},
	]);
});


test('ObjectSchema additional properties can use a union schema', t => {
	const union = Schema.union([
		Schema.string(),
		Schema.number(),
	]);

	const schema = Schema.object()
		.additionalProperties(union);

	const value = {
		name: 'Ada',
		age: 36,
	};

	t.is(
		schema.validate(value),
		value,
	);
});


test('ObjectSchema reports the property path when an additional-property union rejects a value', t => {
	const union = Schema.union([
		Schema.string(),
		Schema.number(),
	]);

	const schema = Schema.object()
		.additionalProperties(union);

	const error = assertValidationError(
		t,
		() => {
			schema.validate({
				value: false,
			});
		},
	);

	t.like(error.issues, [
		{
			path: ['value'],
			schema: union,
		},
	]);
});
