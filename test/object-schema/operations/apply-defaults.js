import test from 'ava';

import Schema from '../../../source/index.js';
import assertValidationError from '../../helpers/assert-validation-error.js';



test('ObjectSchema.applyDefaults() returns the supplied runtime value when no property defaults are configured', t => {
	const value = {
		name: 'Alice',
	};

	t.is(
		Schema.object().properties({
			name: Schema.string(),
		}).applyDefaults(value),
		value,
	);
});


test('ObjectSchema.applyDefaults() throws ValidationError when a required runtime value remains omitted', t => {
	const schema = Schema.object();

	assertValidationError(
		t,
		() => {
			schema.applyDefaults(undefined);
		},
	);
});


test('ObjectSchema.applyDefaults() throws ValidationError when the resulting runtime value is not an object', t => {
	const schema = Schema.object();

	for (const value of [123, 'hello', true, null]) {
		assertValidationError(
			t,
			() => {
				schema.applyDefaults(value);
			},
		);
	}
});


test('ObjectSchema.applyDefaults() applies configured property defaults recursively', t => {
	t.deepEqual(
		Schema.object().properties({
			name: Schema.string().default('Anonymous'),
		}).applyDefaults({}),
		{
			name: 'Anonymous',
		},
	);
});


test('ObjectSchema.applyDefaults() throws when the defaulted result contains an invalid nested value', t => {
	assertValidationError(
		t,
		() => {
			Schema.object().properties({
				name: Schema.string(),
			}).applyDefaults({
				name: 123,
			});
		},
	);
});


test('ObjectSchema.applyDefaults() preserves the prototype of a null-prototype runtime object', t => {
	const value = Object.create(null);

	t.deepEqual(
		Schema.object({
			name: Schema.string().default('Anonymous'),
		}).applyDefaults(value),
		{
			name: 'Anonymous',
		},
	);

	t.is(
		Object.getPrototypeOf(
			Schema.object({
				name: Schema.string().default('Anonymous'), // eslint-disable-line unicorn/max-nested-calls
			}).applyDefaults(value),
		),
		null,
	);
});
