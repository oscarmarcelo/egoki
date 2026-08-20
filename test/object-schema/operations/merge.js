import test from 'ava';

import Schema from '../../../source/index.js';
import assertValidationError from '../../helpers/assert-validation-error.js';



// =============================================================================
// Deep Strategy
// =============================================================================

test('ObjectSchema.merge() merges configured properties', t => {
	t.deepEqual(
		Schema.object().properties({
			name: Schema.string(),
			age: Schema.number(),
		}).merge(
			{
				name: 'Alice',
			},
			{
				age: 42,
			},
		),
		{
			name: 'Alice',
			age: 42,
		},
	);
});


test('ObjectSchema.merge() merges matching properties using their configured property schemas', t => {
	t.deepEqual(
		Schema.object().properties({
			name: Schema.string(),
		}).merge(
			{
				name: 'Alice',
			},
			{
				name: 'Bob',
			},
		),
		{
			name: 'Bob',
		},
	);
});



// =============================================================================
// Recursive Merge
// =============================================================================

test('ObjectSchema.merge() merges nested properties recursively', t => {
	const schema = Schema.object().properties({
		child: Schema.object().properties({
			name: Schema.string(),
			age: Schema.number(),
		}),
	});

	t.deepEqual(
		schema.merge(
			{
				child: {
					name: 'Alice',
				},
			},
			{
				child: {
					age: 42,
				},
			},
		),
		{
			child: {
				name: 'Alice',
				age: 42,
			},
		},
	);
});


test('ObjectSchema.merge() throws ValidationError when the merged runtime value is invalid', t => {
	const schema = Schema.object().properties({
		age: Schema.number(),
	});

	assertValidationError(
		t,
		() => {
			schema.merge(
				{age: 42},
				{age: 'invalid'},
			);
		},
	);
});



// =============================================================================
// Multiple Sources
// =============================================================================

test('ObjectSchema.merge() deep merges multiple sources from left to right', t => {
	const schema = Schema.object({
		format: Schema.string(),
		quality: Schema.number(),
		options: Schema.object({
			lossless: Schema.boolean(),
			progressive: Schema.boolean(),
		}),
	});

	t.deepEqual(
		schema.merge(
			{quality: 70},
			{format: 'webp'},
			{options: {lossless: true}},
			{quality: 60, options: {progressive: false}},
		),
		{
			format: 'webp',
			quality: 60,
			options: {
				lossless: true,
				progressive: false,
			},
		},
	);
});


test('ObjectSchema.merge() merges multiple additional properties through their configured schema', t => {
	const schema = Schema.object()
		.additionalProperties(
			Schema.object({
				left: Schema.number().optional(),
				right: Schema.number().optional(),
			}),
		);

	t.deepEqual(
		schema.merge(
			{item: {left: 1}},
			{item: {right: 2}},
			{other: {left: 3}},
		),
		{
			item: {left: 1, right: 2},
			other: {left: 3},
		},
	);
});


test('ObjectSchema.merge() does not mutate any value while merging multiple sources', t => {
	const schema = Schema.object({
		nested: Schema.object({
			first: Schema.number().optional(),
			second: Schema.number().optional(),
			third: Schema.number().optional(),
		}),
	});
	const target = {nested: {first: 1}};
	const first = {nested: {second: 2}};
	const second = {nested: {third: 3}};

	schema.merge(target, first, second);

	t.deepEqual(
		target,
		{nested: {first: 1}},
	);

	t.deepEqual(
		first,
		{nested: {second: 2}},
	);

	t.deepEqual(
		second,
		{nested: {third: 3}},
	);
});
