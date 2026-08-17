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
