import test from 'ava';

import Schema from '../../source/index.js';
import assertTypeError from '../helpers/assert-type-error.js';



test('Schema.string() returns a schema instance', t => {
	const schema = Schema.string();

	t.true(
		Schema.isSchema(schema),
	);
});


test('Schema.string() returns a new instance', t => {
	t.not(
		Schema.string(),
		Schema.string(),
	);
});


test('Schema.number() returns a schema instance', t => {
	const schema = Schema.number();

	t.true(
		Schema.isSchema(schema),
	);
});


test('Schema.number() returns a new instance', t => {
	t.not(
		Schema.number(),
		Schema.number(),
	);
});


test('Schema.boolean() returns a schema instance', t => {
	const schema = Schema.boolean();

	t.true(
		Schema.isSchema(schema),
	);
});


test('Schema.boolean() returns a new instance', t => {
	t.not(
		Schema.boolean(),
		Schema.boolean(),
	);
});



test('Schema.union() returns a schema instance', t => {
	const schema = Schema.union([
		Schema.string(),
		Schema.number(),
	]);

	t.true(
		Schema.isSchema(schema),
	);
});


test('Schema.union() returns a new instance', t => {
	const alternatives = [
		Schema.string(),
	];

	t.not(
		Schema.union(alternatives),
		Schema.union(alternatives),
	);
});


test('Schema.union() accepts one alternative without collapsing the union schema', t => {
	const schema = Schema.union([
		Schema.string(),
	]);

	assertTypeError(
		t,
		() => {
			schema.extend(Schema.string());
		},
	);
});


test('Schema.union() rejects a non-array alternatives value', t => {
	const error = assertTypeError(
		t,
		() => {
			Schema.union(Schema.string());
		},
	);

	t.true(
		error.message.startsWith('Schema.union() expects an array. Got '),
	);
});


test('Schema.union() rejects an empty alternatives array', t => {
	const error = assertTypeError(
		t,
		() => {
			Schema.union([]);
		},
	);

	t.true(
		error.message.startsWith('Schema.union() expects a non-empty array. Got '),
	);
});


test('Schema.union() rejects a non-schema alternative', t => {
	const error = assertTypeError(
		t,
		() => {
			Schema.union([
				Schema.string(),
				false,
			]);
		},
	);

	t.true(
		error.message.startsWith('Schema.union() expects every item to be a Schema'),
	);
});


test('Schema.array() returns a schema instance', t => {
	const schema = Schema.array(
		Schema.string(),
	);

	t.true(
		Schema.isSchema(schema),
	);
});


test('Schema.array() returns a new instance', t => {
	t.not(
		Schema.array(Schema.string()),
		Schema.array(Schema.string()),
	);
});


test('Schema.array() requires a Schema item', t => {
	for (const value of ['string', {}, 123, null, undefined]) {
		assertTypeError(
			t,
			() => Schema.array(value),
		);
	}
});


test('Schema.object() returns a schema instance', t => {
	const schema = Schema.object();

	t.true(
		Schema.isSchema(schema),
	);
});


test('Schema.object() returns a new instance', t => {
	t.not(
		Schema.object(),
		Schema.object(),
	);
});


test('Schema.object() accepts an empty property map', t => {
	t.notThrows(
		() => Schema.object({}),
	);
});


test('Schema.object() requires every property to be a Schema', t => {
	for (const value of ['string', {}, null]) {
		assertTypeError(
			t,
			() => Schema.object({
				name: value,
			}),
		);
	}
});
