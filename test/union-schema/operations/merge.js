import test from 'ava';

import Schema from '../../../source/index.js';
import assertValidationError from '../../helpers/assert-validation-error.js';



test('UnionSchema.merge() replaces the target with a defined source', t => {
	const schema = Schema.union([
		Schema.string(),
		Schema.number(),
	]);

	t.is(
		schema.merge('old', 42),
		42,
	);
});


test('UnionSchema.merge() retains the target when the source is omitted', t => {
	const schema = Schema.union([
		Schema.string(),
		Schema.number(),
	]);

	t.is(
		schema.merge('old', undefined),
		'old',
	);
});



test('UnionSchema.merge() rejects an omitted result for a required union', t => {
	const schema = Schema.union([
		Schema.string(),
		Schema.number(),
	]);

	assertValidationError(
		t,
		() => {
			schema.merge(undefined, undefined);
		},
	);
});


test('UnionSchema.merge() accepts an omitted result for an optional union', t => {
	const schema = Schema.union([
		Schema.string(),
		Schema.number(),
	]).optional();

	t.is(
		schema.merge(undefined, undefined),
		undefined,
	);
});


test('UnionSchema.merge() does not infer deep merging from an object alternative', t => {
	const schema = Schema.union([
		Schema.object(),
		Schema.string(),
	]);

	const target = {
		left: true,
	};

	const source = {
		right: true,
	};

	t.is(
		schema.merge(target, source),
		source,
	);
});


test('UnionSchema.merge() uses replacement when nested in deep object merging', t => {
	const union = Schema.union([
		Schema.object(),
		Schema.string(),
	]);

	const schema = Schema.object({
		options: union,
	});

	const source = {
		options: {
			right: true,
		},
	};

	t.is(
		schema.merge(
			{
				options: {left: true},
			},
			source,
		).options,
		source.options,
	);
});


test('UnionSchema.merge() uses replacement for object additional properties', t => {
	const union = Schema.union([
		Schema.object(),
		Schema.string(),
	]);

	const schema = Schema.object()
		.additionalProperties(union);

	const source = {
		options: {
			right: true,
		},
	};

	t.is(
		schema.merge(
			{
				options: {left: true},
			},
			source,
		).options,
		source.options,
	);
});


test('UnionSchema.merge() validates the replacement result against the union', t => {
	const schema = Schema.union([
		Schema.string(),
		Schema.number(),
	]);

	assertValidationError(
		t,
		() => {
			schema.merge('old', false);
		},
	);
});
