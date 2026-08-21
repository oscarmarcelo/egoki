import test from 'ava';

import Schema from '../../../source/index.js';
import assertTypeError from '../../helpers/assert-type-error.js';



test('get() returns the receiving schema for an omitted path', t => {
	const schema = Schema.string();

	t.is(schema.get(), schema);
});


test('get() returns the receiving schema for an undefined path', t => {
	const schema = Schema.string();

	t.is(schema.get(undefined), schema);
});


test('get() returns the receiving schema for an empty array path', t => {
	const schema = Schema.string();

	t.is(schema.get([]), schema);
});


test('get() traverses declared object properties', t => {
	const property = Schema.string();
	const schema = Schema.object({user: Schema.object({name: property})});

	t.is(schema.get(['user', 'name']), property);
});


test('get() supports dot-separated paths', t => {
	const property = Schema.string();
	const schema = Schema.object({user: Schema.object({name: property})});

	t.is(schema.get('user.name'), property);
});


test('get() treats an empty string as an object property', t => {
	const property = Schema.string();
	const schema = Schema.object({'': property});

	t.is(schema.get(''), property);
});


test('get() uses array paths for property names containing dots', t => {
	const property = Schema.string();
	const schema = Schema.object({'user.name': property});

	t.is(schema.get(['user.name']), property);
	t.is(schema.get('user.name'), undefined);
});


test('get() traverses array items with numeric segments', t => {
	const item = Schema.object({name: Schema.string()});
	const schema = Schema.array(item);

	t.is(schema.get([42]), item);
});


test('get() traverses array items with canonical decimal string segments', t => {
	const item = Schema.string();
	const schema = Schema.array(item);

	t.is(schema.get('12'), item);
});


test('get() preserves numeric object property keys as object keys', t => {
	const property = Schema.string();
	const schema = Schema.object({0: property});

	t.is(schema.get('0'), property);
});


test('get() returns undefined when an object property is not declared', t => {
	t.is(Schema.object().get(['missing']), undefined);
});


test('get() does not traverse additional properties', t => {
	const schema = Schema.object().additionalProperties(Schema.string());

	t.is(schema.get(['missing']), undefined);
});


test('get() returns undefined when an array has no item schema', t => {
	t.is(Schema.array().get([0]), undefined);
});


test('get() returns undefined for a non-index array segment', t => {
	t.is(Schema.array(Schema.string()).get(['name']), undefined);
});


test('get() does not traverse union alternatives', t => {
	const schema = Schema.union([
		Schema.object({name: Schema.string()}),
	]);

	t.is(schema.get(['name']), undefined);
});


test('get() returns a union when the path ends at the union', t => {
	const union = Schema.union([Schema.string()]);
	const schema = Schema.object({value: union});

	t.is(schema.get(['value']), union);
});


test('get() returns undefined when a primitive schema cannot consume the path', t => {
	t.is(Schema.string().get(['name']), undefined);
});


for (const path of [null, true, 1, {}]) {
	test(`get() rejects invalid path ${String(path)}`, t => {
		assertTypeError(
			t,
			() => {
				Schema.string().get(path);
			},
		);
	});
}


for (const segment of [null, true, -1, 1.5, {}, undefined]) {
	test(`get() rejects invalid array path segment ${String(segment)}`, t => {
		assertTypeError(
			t,
			() => {
				Schema.string().get([segment]);
			},
		);
	});
}


test('get() does not modify an array path', t => {
	const path = ['user', 'name'];
	const schema = Schema.object({user: Schema.object({name: Schema.string()})});

	schema.get(path);

	t.deepEqual(path, ['user', 'name']);
});
