import test from 'ava';

import Schema from '../../../source/index.js';
import assertValidationError from '../../helpers/assert-validation-error.js';



test('ObjectSchema.deep() returns a new schema configured for deep merging', t => {
	const original = Schema.object({
		a: Schema.object(),
	});
	const deep = original.deep();

	t.not(original, deep);

	t.deepEqual(
		original.merge(
			{
				a: {
					x: 1,
				},
			},
			{
				a: {
					y: 2,
				},
			},
		),
		{
			a: {
				x: 1,
				y: 2,
			},
		},
	);

	t.deepEqual(
		deep.merge(
			{
				a: {
					x: 1,
				},
			},
			{
				a: {
					y: 2,
				},
			},
		),
		{
			a: {
				x: 1,
				y: 2,
			},
		},
	);
});


test('Deep merge returns the source when the target is not a plain object', t => {
	const schema = Schema.object().deep();

	const source = {
		name: 'John',
	};

	t.is(
		schema.merge(123, source),
		source,
	);
});


test('Deep merge throws ValidationError when the source is not a plain object', t => {
	const schema = Schema.object().deep();

	assertValidationError(
		t,
		() => {
			schema.merge(
				{
					name: 'John',
				},
				123,
			);
		},
	);
});


test('Deep merge recursively merges declared child object properties', t => {
	const schema = Schema.object()
		.properties({
			child: Schema.object(),
		})
		.deep();

	t.deepEqual(
		schema.merge(
			{
				child: {
					left: 1,
				},
			},
			{
				child: {
					right: 2,
				},
			},
		),
		{
			child: {
				left: 1,
				right: 2,
			},
		},
	);
});


test('Deep merge respects the declared child merge strategy', t => {
	const schema = Schema.object()
		.properties({
			child: Schema.object().replace(),
		})
		.deep();

	t.deepEqual(
		schema.merge(
			{
				child: {
					left: 1,
				},
			},
			{
				child: {
					right: 2,
				},
			},
		),
		{
			child: {
				right: 2,
			},
		},
	);
});


test('Deep merge recursively merges additional properties', t => {
	const schema = Schema.object()
		.additionalProperties(
			Schema.object(),
		)
		.deep();

	t.deepEqual(
		schema.merge(
			{
				a: {
					x: 1,
				},
			},
			{
				a: {
					y: 2,
				},
			},
		),
		{
			a: {
				x: 1,
				y: 2,
			},
		},
	);
});


test('Deep merge ignores declared properties when applying the additional properties schema', t => {
	const schema = Schema.object()
		.properties({
			known: Schema.object().replace(),
		})
		.additionalProperties(
			Schema.object(),
		)
		.deep();

	t.deepEqual(
		schema.merge(
			{
				known: {
					left: 1,
				},
				extra: {
					left: 1,
				},
			},
			{
				known: {
					right: 2,
				},
				extra: {
					right: 2,
				},
			},
		),
		{
			known: {
				right: 2,
			},
			extra: {
				left: 1,
				right: 2,
			},
		},
	);
});
