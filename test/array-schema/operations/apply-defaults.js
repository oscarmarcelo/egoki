import test from 'ava';

import Schema from '../../../source/index.js';
import assertValidationError from '../../helpers/assert-validation-error.js';



// =============================================================================
// General Operation Semantics
// =============================================================================

test('ArraySchema.applyDefaults() returns the supplied runtime value when no item defaults are configured', t => {
	const value = [
		'Alice',
	];

	t.is(
		Schema.array()
			.items(Schema.string())
			.applyDefaults(value),
		value,
	);
});


test('ArraySchema.applyDefaults() throws ValidationError when a required runtime value remains omitted', t => {
	const schema = Schema.array();

	assertValidationError(
		t,
		() => {
			schema.applyDefaults(undefined);
		},
	);
});


test('ArraySchema.applyDefaults() throws ValidationError when the resulting runtime value contains an invalid item', t => {
	assertValidationError(
		t,
		() => {
			Schema.array(Schema.number())
				.applyDefaults(['invalid']);
		},
	);
});


test('ArraySchema.applyDefaults() throws ValidationError when the resulting runtime value is not an array', t => {
	const schema = Schema.array();

	assertValidationError(
		t,
		() => {
			schema.applyDefaults('value');
		},
	);
});
