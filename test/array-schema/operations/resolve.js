import test from 'ava';

import Schema from '../../../source/index.js';



// =============================================================================
// Append
// =============================================================================

test('ArraySchema.resolve() appends the source runtime value to the configured default runtime value', t => {
	t.deepEqual(
		Schema.array()
			.default([
				1,
				2,
			])
			.append()
			.resolve(
				undefined,
				[
					3,
				],
			),
		[
			1,
			2,
			3,
		],
	);
});



// =============================================================================
// Prepend
// =============================================================================

test('ArraySchema.resolve() prepends the source runtime value to the configured default runtime value', t => {
	t.deepEqual(
		Schema.array()
			.default([
				2,
				3,
			])
			.prepend()
			.resolve(
				undefined,
				[
					1,
				],
			),
		[
			1,
			2,
			3,
		],
	);
});



// =============================================================================
// Deep Merge
// =============================================================================

test('ArraySchema.resolve() applies defaults recursively to array items before merging', t => {
	const schema = Schema.array()
		.items(
			Schema.object()
				.properties({
					name: Schema.string()
						.default('John'),
				}),
		)
		.append();

	t.deepEqual(
		schema.resolve(
			[
				{},
			],
			[],
		),
		[
			{
				name: 'John',
			},
		],
	);
});



// =============================================================================
// Immutability
// =============================================================================

test('ArraySchema.resolve() does not modify either supplied runtime value', t => {
	const schema = Schema.array()
		.items(
			Schema.number(),
		)
		.append();

	const target = [
		1,
		2,
	];

	const source = [
		3,
	];

	schema.resolve(target, source);

	t.deepEqual(
		target,
		[
			1,
			2,
		],
	);

	t.deepEqual(
		source,
		[
			3,
		],
	);
});



// =============================================================================
// Multiple Sources
// =============================================================================

test('ArraySchema.resolve() appends multiple sources after the configured root default', t => {
	t.deepEqual(
		Schema.array(Schema.string())
			.append()
			.default(['default'])
			.resolve(
				undefined,
				['first'],
				['second'],
			),
		['default', 'first', 'second'],
	);
});


test('ArraySchema.resolve() prepends multiple sources before the configured root default', t => {
	t.deepEqual(
		Schema.array(Schema.string())
			.prepend()
			.default(['default'])
			.resolve(
				undefined,
				['first'],
				['second'],
			),
		['second', 'first', 'default'],
	);
});


test('ArraySchema.resolve() uses a configured root default as the base of keyed merging', t => {
	const schema = Schema.array(
		Schema.object({
			id: Schema.number(),
			name: Schema.string(),
		}),
	)
		.keyedBy('id')
		.default([
			{id: 1, name: 'Default'},
		]);

	t.deepEqual(
		schema.resolve(
			undefined,
			[{id: 1, name: 'Configured'}],
			[{id: 2, name: 'Added'}],
		),
		[
			{id: 1, name: 'Configured'},
			{id: 2, name: 'Added'},
		],
	);
});



// =============================================================================
// Final Defaulting
// =============================================================================

test('ArraySchema.resolve() applies item defaults to items introduced by sources', t => {
	const schema = Schema.array(
		Schema.object({
			name: Schema.string(),
			enabled: Schema.boolean().default(true),
		}),
	).append();

	t.deepEqual(
		schema.resolve(
			[],
			[{name: 'First'}],
			[{name: 'Second', enabled: false}],
		),
		[
			{name: 'First', enabled: true},
			{name: 'Second', enabled: false},
		],
	);
});


test('ArraySchema.resolve() applies defaults to new keyed items introduced by sources', t => {
	const schema = Schema.array(
		Schema.object({
			id: Schema.number(),
			name: Schema.string(),
			enabled: Schema.boolean().default(true),
		}),
	).keyedBy('id');

	t.deepEqual(
		schema.resolve(
			[],
			[{id: 1, name: 'First'}],
			[{id: 2, name: 'Second', enabled: false}],
		),
		[
			{id: 1, name: 'First', enabled: true},
			{id: 2, name: 'Second', enabled: false},
		],
	);
});



// =============================================================================
// Default Immutability
// =============================================================================

test('ArraySchema.resolve() does not mutate configured defaults', t => {
	const configuredDefault = [
		{
			name: 'Default',
			enabled: true,
		},
	];

	const schema = Schema.array(
		Schema.object({
			name: Schema.string(),
			enabled: Schema.boolean().default(true),
		}),
	)
		.append()
		.default(configuredDefault);

	schema.resolve(undefined, [{name: 'Source'}]);

	t.deepEqual(
		configuredDefault,
		[
			{
				name: 'Default',
				enabled: true,
			},
		],
	);
});


test('ArraySchema.resolve() does not leak mutations between repeated results', t => {
	const schema = Schema.array(
		Schema.object({
			name: Schema.string(),
			enabled: Schema.boolean().default(true),
		}),
	).append();

	const source = [{name: 'Source'}];
	const first = schema.resolve([], source);
	first[0].name = 'Changed';
	first[0].enabled = false;

	const second = schema.resolve([], source);

	t.deepEqual(
		source,
		[{name: 'Source'}],
	);

	t.deepEqual(
		second,
		[{name: 'Source', enabled: true}],
	);
});
