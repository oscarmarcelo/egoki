import test from 'ava';

import Schema from '../../source/index.js';
import assertTypeError from '../helpers/assert-type-error.js';



test('Schema instances do not expose their configuration or reconstruction API', t => {
	const schema = Schema.string();

	t.is(
		schema.options,
		undefined,
	);

	t.deepEqual(
		Object.getOwnPropertySymbols(schema),
		[],
	);
});


test('Schema factories expose no internal configuration parameter', t => {
	const schema = Schema.string({
		type: 'number',
	});

	t.true(
		schema.test('value'),
	);

	t.false(
		schema.test(42),
	);
});


test('Schema factories expose no concrete schema constructors', async t => {
	const module = await import('../../source/index.js');

	for (const name of ['StringSchema', 'NumberSchema', 'BooleanSchema', 'ArraySchema', 'ObjectSchema']) {
		t.false(
			Object.hasOwn(module, name),
		);
	}
});


test('Schema.isSchema() does not recognize objects that merely resemble schemas', t => {
	const schema = Schema.string();
	const copy = {...schema};

	t.false(
		Schema.isSchema(copy),
	);
});


test('Invalid builder configuration is rejected instead of reconfiguring the schema type', t => {
	assertTypeError(t, () => Schema.array().items('number'));

	const schema = Schema.string();

	t.true(
		schema.test('value'),
	);

	t.false(
		schema.test(42),
	);
});


test('Schema configuration supports cyclic runtime values', t => {
	const value = {};
	value.self = value;

	const schema = Schema.object()
		.default(value);

	t.is(
		schema.applyDefaults(undefined),
		value,
	);
});


test('Schema configuration deep-freezes nested values of already frozen containers', t => {
	const nested = {};
	const value = Object.freeze({nested});

	Schema.object().default(value);

	t.true(
		Object.isFrozen(nested),
	);
});
