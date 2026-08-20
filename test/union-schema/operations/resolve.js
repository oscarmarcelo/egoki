import test from 'ava';

import Schema from '../../../source/index.js';



function createSchema() {
	const objectAlternative = Schema.object({
		name: Schema.string().default('Anonymous'),
	});

	return Schema.union([
		objectAlternative,
		Schema.string(),
	]);
}



test('UnionSchema.resolve() applies union-aware defaults before replacement merging', t => {
	const schema = createSchema();
	const source = 'override';

	t.is(
		schema.resolve({}, source),
		source,
	);
});


test('UnionSchema.resolve() returns recursively defaulted target when the source is omitted', t => {
	const schema = createSchema();

	t.deepEqual(
		schema.resolve({}, undefined),
		{
			name: 'Anonymous',
		},
	);
});


test('UnionSchema.resolve() applies nested defaults to an alternative introduced by a later source', t => {
	const schema = Schema.union([
		Schema.object({
			kind: Schema.string().enum(['object']),
			options: Schema.object({
				enabled: Schema.boolean().default(true), // eslint-disable-line unicorn/max-nested-calls
			}),
		}),
		Schema.string(),
	]);

	t.deepEqual(
		schema.resolve(
			'initial',
			{
				kind: 'object',
				options: {},
			},
		),
		{
			kind: 'object',
			options: {enabled: true},
		},
	);
});
