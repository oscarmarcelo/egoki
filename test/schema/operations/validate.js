import test from 'ava';

import Schema from '../../../source/index.js';
import assertValidationError from '../../helpers/assert-validation-error.js';
import nonBooleans from '../../helpers/fixtures/non-booleans.js';
import nonNumbers from '../../helpers/fixtures/non-numbers.js';
import nonStrings from '../../helpers/fixtures/non-strings.js';
import label from '../../helpers/label.js';



// =============================================================================
// General Operation Semantics.
// =============================================================================

test('validate() returns the original runtime value when validation succeeds', t => {
	const schema = Schema.string();

	const value = 'John';

	t.is(
		schema.validate(value),
		value,
	);
});


test('validate() throws ValidationError when validation fails', t => {
	assertValidationError(
		t,
		() => {
			Schema.string().validate(123);
		},
	);
});



// =============================================================================
// Required / Optional
// =============================================================================

test('validate() accepts an omitted runtime value for an optional schema', t => {
	t.is(
		Schema.string()
			.optional()
			.validate(undefined),
		undefined,
	);
});


test('validate() rejects an omitted runtime value for a required schema', t => {
	assertValidationError(
		t,
		() => {
			Schema.string()
				.required()
				.validate(undefined);
		},
	);
});


test('validate() does not apply configured default values', t => {
	t.is(
		Schema.string()
			.default('Anonymous')
			.optional()
			.validate(undefined),
		undefined,
	);
});



// =============================================================================
// Primitive Runtime Types
// =============================================================================

// String
// -----------------------------------------------------------------------------
test('validate() accepts a string runtime value', t => {
	const value = 'John';

	t.is(
		Schema.string().validate(value),
		value,
	);
});


for (const value of nonStrings) {
	test(`validate() rejects ${label(value)} as a string runtime value`, t => {
		assertValidationError(
			t,
			() => {
				Schema.string().validate(value);
			},
		);
	});
}


// Number
// -----------------------------------------------------------------------------
test('validate() accepts a number runtime value', t => {
	const value = 123;

	t.is(
		Schema.number().validate(value),
		value,
	);
});


for (const value of nonNumbers) {
	test(`validate() rejects ${label(value)} as a number runtime value`, t => {
		assertValidationError(
			t,
			() => {
				Schema.number().validate(value);
			},
		);
	});
}


// Boolean
// -----------------------------------------------------------------------------
test('validate() accepts a boolean runtime value', t => {
	const value = true; // eslint-disable-line unicorn/consistent-boolean-name

	t.is(
		Schema.boolean().validate(value),
		value,
	);
});


for (const value of nonBooleans) {
	test(`validate() rejects ${label(value)} as a boolean runtime value`, t => {
		assertValidationError(
			t,
			() => {
				Schema.boolean().validate(value);
			},
		);
	});
}



// =============================================================================
// Enumerations
// =============================================================================

test('validate() accepts a string runtime value contained in the configured enum', t => {
	const value = 'green';

	t.is(
		Schema.string()
			.enum(['red', 'green', 'blue'])
			.validate(value),
		value,
	);
});


test('validate() rejects a string runtime value not contained in the configured enum', t => {
	assertValidationError(
		t,
		() => {
			Schema.string()
				.enum(['red', 'green', 'blue'])
				.validate('yellow');
		},
	);
});


test('validate() accepts a number runtime value contained in the configured enum', t => {
	const value = 2;

	t.is(
		Schema.number()
			.enum([1, 2, 3])
			.validate(value),
		value,
	);
});


test('validate() rejects a number runtime value not contained in the configured enum', t => {
	assertValidationError(
		t,
		() => {
			Schema.number()
				.enum([1, 2, 3])
				.validate(4);
		},
	);
});


test('validate() accepts a boolean runtime value contained in the configured enum', t => {
	const value = true; // eslint-disable-line unicorn/consistent-boolean-name

	t.is(
		Schema.boolean()
			.enum([true])
			.validate(value),
		value,
	);
});


test('validate() rejects a boolean runtime value not contained in the configured enum', t => {
	assertValidationError(
		t,
		() => {
			Schema.boolean()
				.enum([true])
				.validate(false);
		},
	);
});



// =============================================================================
// Arrays
// =============================================================================

test('validate() accepts an array whose items satisfy the configured item schema', t => {
	const value = [
		'Alice',
		'Bob',
	];

	t.is(
		Schema.array()
			.items(Schema.string())
			.validate(value),
		value,
	);
});


test('validate() rejects a non-array runtime value', t => {
	assertValidationError(
		t,
		() => {
			Schema.array()
				.items(Schema.string())
				.validate('Alice');
		},
	);
});


test('validate() rejects an array containing an invalid item', t => {
	assertValidationError(
		t,
		() => {
			Schema.array()
				.items(Schema.string())
				.validate([
					'Alice',
					123,
				]);
		},
	);
});



// =============================================================================
// Objects
// =============================================================================

test('validate() accepts an object whose properties satisfy the configured property schemas', t => {
	const value = {
		name: 'Alice',
		age: 30,
	};

	t.is(
		Schema.object()
			.properties({
				name: Schema.string(),
				age: Schema.number(),
			})
			.validate(value),
		value,
	);
});


test('validate() rejects a non-object runtime value', t => {
	assertValidationError(
		t,
		() => {
			Schema.object().validate('Alice');
		},
	);
});


test('validate() rejects an object whose property does not satisfy its configured schema', t => {
	assertValidationError(
		t,
		() => {
			Schema.object()
				.properties({
					name: Schema.string(),
				})
				.validate({
					name: 123,
				});
		},
	);
});



// =============================================================================
// Nested Validation
// =============================================================================

test('validate() validates nested array item schemas recursively', t => {
	const value = [
		{
			name: 'Alice',
		},
	];

	t.is(
		Schema.array()
			.items(
				Schema.object().properties({
					name: Schema.string(), // eslint-disable-line unicorn/max-nested-calls
				}),
			)
			.validate(value),
		value,
	);
});


test('validate() rejects an invalid nested array item', t => {
	assertValidationError(
		t,
		() => {
			Schema.array()
				.items(
					Schema.object().properties({
						name: Schema.string(),
					}),
				)
				.validate([
					{
						name: 123,
					},
				]);
		},
	);
});


test('validate() validates nested object property schemas recursively', t => {
	const value = {
		user: {
			name: 'Alice',
		},
	};

	t.is(
		Schema.object()
			.properties({
				user: Schema.object().properties({
					name: Schema.string(), // eslint-disable-line unicorn/max-nested-calls
				}),
			})
			.validate(value),
		value,
	);
});


test('validate() rejects an invalid nested object property', t => {
	assertValidationError(
		t,
		() => {
			Schema.object()
				.properties({
					user: Schema.object().properties({
						name: Schema.string(),
					}),
				})
				.validate({
					user: {
						name: 123,
					},
				});
		},
	);
});
