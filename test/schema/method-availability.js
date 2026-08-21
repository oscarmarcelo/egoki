import test from 'ava';

import Schema from '../../source/index.js';



test('All schemas expose common inspection operations', t => {
	for (const schema of [
		Schema.string(),
		Schema.number(),
		Schema.boolean(),
		Schema.array(),
		Schema.object(),
		Schema.union([Schema.string()]),
	]) {
		t.is(
			typeof schema.get,
			'function',
		);

		t.is(
			typeof schema.getSchemas,
			'function',
		);
	}
});



test('All schemas expose extend()', t => {
	for (const schema of [
		Schema.string(),
		Schema.number(),
		Schema.boolean(),
		Schema.array(),
		Schema.object(),
		Schema.union([Schema.string()]),
	]) {
		t.is(
			typeof schema.extend,
			'function',
		);
	}
});


test('Primitive schemas expose enum()', t => {
	for (const schema of [Schema.string(), Schema.number(), Schema.boolean()]) {
		t.is(
			typeof schema.enum,
			'function',
		);
	}
});


test('Non-primitive schemas do not expose enum()', t => {
	for (const schema of [
		Schema.array(),
		Schema.object(),
		Schema.union([Schema.string()]),
	]) {
		t.is(
			schema.enum,
			undefined,
		);
	}
});


test('ArraySchema exposes array merge strategies', t => {
	const schema = Schema.array();

	t.is(
		typeof schema.append,
		'function',
	);

	t.is(
		typeof schema.prepend,
		'function',
	);

	t.is(
		typeof schema.keyedBy,
		'function',
	);
});


test('ObjectSchema exposes deep()', t => {
	t.is(
		typeof Schema.object().deep,
		'function',
	);
});


test('Schemas do not expose incompatible merge strategy builders', t => {
	for (const schema of [
		Schema.string(),
		Schema.number(),
		Schema.boolean(),
		Schema.union([Schema.string()]),
	]) {
		t.is(
			schema.append,
			undefined,
		);

		t.is(
			schema.prepend,
			undefined,
		);

		t.is(
			schema.keyedBy,
			undefined,
		);

		t.is(
			schema.deep,
			undefined,
		);
	}

	t.is(
		Schema.array().deep,
		undefined,
	);

	t.is(
		Schema.object().append,
		undefined,
	);

	t.is(
		Schema.object().prepend,
		undefined,
	);

	t.is(
		Schema.object().keyedBy,
		undefined,
	);
});
