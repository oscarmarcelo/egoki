import test from 'ava';

import Schema from '../../../source/index.js';
import assertTypeError from '../../helpers/assert-type-error.js';



test('getSchemas() returns the receiving schema for an omitted path', t => {
	const schema = Schema.string();

	t.deepEqual(schema.getSchemas(), [schema]);
});


test('getSchemas() returns the receiving schema for an undefined path', t => {
	const schema = Schema.string();

	t.deepEqual(schema.getSchemas(undefined), [schema]);
});


test('getSchemas() returns the receiving schema for an empty array path', t => {
	const schema = Schema.string();

	t.deepEqual(schema.getSchemas([]), [schema]);
});


test('getSchemas() traverses declared object properties', t => {
	const property = Schema.string();
	const schema = Schema.object({name: property});

	t.deepEqual(schema.getSchemas(['name']), [property]);
});


test('getSchemas() uses additional properties as a fallback', t => {
	const additional = Schema.number();
	const schema = Schema.object().additionalProperties(additional);

	t.deepEqual(schema.getSchemas(['missing']), [additional]);
});


test('getSchemas() gives declared properties precedence over additional properties', t => {
	const property = Schema.string();
	const schema = Schema.object({name: property}).additionalProperties(Schema.number());

	t.deepEqual(schema.getSchemas(['name']), [property]);
});


test('getSchemas() ignores boolean additional-properties configurations', t => {
	t.deepEqual(Schema.object().additionalProperties(true).getSchemas(['name']), []);
	t.deepEqual(Schema.object().additionalProperties(false).getSchemas(['name']), []);
});


test('getSchemas() traverses recursively through additional properties', t => {
	const leaf = Schema.number();
	const schema = Schema.object().additionalProperties(
		Schema.object({id: leaf}),
	);

	t.deepEqual(schema.getSchemas(['anything', 'id']), [leaf]);
});


test('getSchemas() traverses array items', t => {
	const item = Schema.string();

	t.deepEqual(Schema.array(item).getSchemas([7]), [item]);
});


test('getSchemas() branches through unions while path segments remain', t => {
	const string = Schema.string();
	const number = Schema.number();
	const schema = Schema.union([
		Schema.object({value: string}),
		Schema.object({value: number}),
	]);

	t.deepEqual(schema.getSchemas(['value']), [string, number]);
});


test('getSchemas() skips union alternatives that cannot resolve the path', t => {
	const string = Schema.string();
	const schema = Schema.union([
		Schema.object({name: string}),
		Schema.number(),
		Schema.object({other: Schema.boolean()}),
	]);

	t.deepEqual(schema.getSchemas(['name']), [string]);
});


test('getSchemas() traverses nested unions recursively', t => {
	const string = Schema.string();
	const number = Schema.number();
	const boolean = Schema.boolean();
	const schema = Schema.union([
		Schema.object({user: Schema.object({name: string})}),
		Schema.object({
			user: Schema.union([
				Schema.object({name: number}), // eslint-disable-line unicorn/max-nested-calls
				Schema.object({name: boolean}), // eslint-disable-line unicorn/max-nested-calls
			]),
		}),
	]);

	t.deepEqual(schema.getSchemas(['user', 'name']), [string, number, boolean]);
});


test('getSchemas() returns a union itself when the path ends there', t => {
	const union = Schema.union([Schema.string(), Schema.number()]);
	const schema = Schema.object({value: union});

	t.deepEqual(schema.getSchemas(['value']), [union]);
});


test('getSchemas() combines declared and additional-property results across union alternatives', t => {
	const string = Schema.string();
	const number = Schema.number();
	const schema = Schema.union([
		Schema.object({name: string}),
		Schema.object().additionalProperties(number),
	]);

	t.deepEqual(schema.getSchemas(['name']), [string, number]);
});


test('getSchemas() deduplicates the same schema instance reached through multiple routes', t => {
	const shared = Schema.string();
	const schema = Schema.union([
		Schema.object({name: shared}),
		Schema.object({name: shared}),
	]);

	t.deepEqual(schema.getSchemas(['name']), [shared]);
});


test('getSchemas() preserves distinct equivalent schema instances', t => {
	const first = Schema.string();
	const second = Schema.string();
	const schema = Schema.union([
		Schema.object({name: first}),
		Schema.object({name: second}),
	]);

	t.deepEqual(schema.getSchemas(['name']), [first, second]);
});


test('getSchemas() returns an empty array when no branch resolves the path', t => {
	t.deepEqual(Schema.object().getSchemas(['missing']), []);
});


test('getSchemas() supports dot-separated paths', t => {
	const property = Schema.string();
	const schema = Schema.object({user: Schema.object({name: property})});

	t.deepEqual(schema.getSchemas('user.name'), [property]);
});


test('getSchemas() rejects an invalid path representation', t => {
	assertTypeError(
		t,
		() => {
			Schema.string().getSchemas(null);
		},
	);
});


test('getSchemas() rejects invalid array path segments', t => {
	assertTypeError(
		t,
		() => {
			Schema.string().getSchemas([-1]);
		},
	);
});


test('getSchemas() does not modify an array path', t => {
	const path = ['user', 'name'];
	const schema = Schema.object({user: Schema.object({name: Schema.string()})});

	schema.getSchemas(path);

	t.deepEqual(path, ['user', 'name']);
});
