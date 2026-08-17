import test from 'ava';

import Schema from '../../../source/index.js';
import assertTypeError from '../../helpers/assert-type-error.js';
import assertValidationError from '../../helpers/assert-validation-error.js';
import nonSchemasAndBooleans from '../../helpers/fixtures/non-schemas-and-booleans.js';
import label from '../../helpers/label.js';



test('ObjectSchema.additionalProperties() returns a new schema instance', t => {
	const schema = Schema.object();

	t.not(
		schema.additionalProperties(true),
		schema,
	);
});


for (const value of nonSchemasAndBooleans) {
	test(`ObjectSchema.additionalProperties() rejects ${label(value)} as the additional properties configuration`, t => {
		assertTypeError(
			t,
			() => {
				Schema.object().additionalProperties(value);
			},
		);
	});
}


test('ObjectSchema.additionalProperties() accepts true', t => {
	t.notThrows(() => {
		Schema.object().additionalProperties(true);
	});
});


test('ObjectSchema.additionalProperties() accepts a schema', t => {
	t.notThrows(() => {
		Schema.object().additionalProperties(
			Schema.string(),
		);
	});
});


test('ObjectSchema.additionalProperties(false) rejects unknown properties', t => {
	const schema = Schema.object()
		.additionalProperties(false);

	const error = assertValidationError(
		t,
		() => {
			schema.validate({
				name: 'John',
			});
		},
	);

	t.like(error.issues, [
		{
			path: ['name'],
			message: 'Unexpected property',
		},
	]);
});


test('ObjectSchema.additionalProperties(schema) validates unknown properties', t => {
	const schema = Schema.object()
		.additionalProperties(
			Schema.number(),
		);

	const error = assertValidationError(
		t,
		() => {
			schema.validate({
				age: 'ten',
			});
		},
	);

	t.like(error.issues, [
		{
			path: ['age'],
		},
	]);
});


test('ObjectSchema.applyDefaults() applies defaults to additional properties', t => {
	const schema = Schema.object()
		.properties({
			name: Schema.string().default('Anonymous'),
		})
		.additionalProperties(
			Schema.number().default(0),
		);

	t.deepEqual(
		schema.applyDefaults({
			age: undefined,
		}),
		{
			name: 'Anonymous',
			age: 0,
		},
	);
});


test('ObjectSchema.additionalProperties() rejects a preserved default with invalid additional properties', t => {
	const schema = Schema.object().default({
		count: 'one',
	});

	assertTypeError(
		t,
		() => {
			schema.additionalProperties(Schema.number());
		},
	);
});


test('ObjectSchema.additionalProperties(false) rejects a preserved default with additional properties', t => {
	const schema = Schema.object().default({
		name: 'Alice',
	});

	assertTypeError(
		t,
		() => {
			schema.additionalProperties(false);
		},
	);
});
