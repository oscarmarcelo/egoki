import test from 'ava';

import Schema from '../../../source/index.js';



// =============================================================================
// Defaults
// =============================================================================

test('ObjectSchema.resolve() applies property default values before merging', t => {
	t.deepEqual(
		Schema.object()
			.properties({
				name: Schema.string()
					.default('John'),
			})
			.resolve(
				{},
				{},
			),
		{
			name: 'John',
		},
	);
});



// =============================================================================
// Merge
// =============================================================================

test('ObjectSchema.resolve() deep merges the resolved target runtime value with the source runtime value', t => {
	t.deepEqual(
		Schema.object()
			.properties({
				name: Schema.string(),
			})
			.resolve(
				{
					name: 'John',
				},
				{
					name: 'Jane',
				},
			),
		{
			name: 'Jane',
		},
	);
});



test('ObjectSchema.resolve() applies defaults recursively before merging', t => {
	const schema = Schema.object()
		.properties({
			user: Schema.object()
				.properties({
					name: Schema.string()
						.default('John'),
				}),
		});

	t.deepEqual(
		schema.resolve(
			{
				user: {},
			},
			{},
		),
		{
			user: {
				name: 'John',
			},
		},
	);
});



// =============================================================================
// Transactional Resolution
// =============================================================================

test('ObjectSchema.resolve() resolves multiple incomplete fragments transactionally', t => {
	const schema = Schema.object({
		format: Schema.string(),
		quality: Schema.number().default(80),
		options: Schema.object({
			lossless: Schema.boolean().default(false),
		}),
	});

	t.deepEqual(
		schema.resolve(
			{quality: 70},
			{format: 'webp'},
			{options: {lossless: true}},
			{quality: 60},
		),
		{
			format: 'webp',
			quality: 60,
			options: {lossless: true},
		},
	);
});



// =============================================================================
// Final Defaulting
// =============================================================================

test('ObjectSchema.resolve() applies defaults inside an object introduced only by a source', t => {
	const schema = Schema.object({
		options: Schema.object({
			enabled: Schema.boolean().default(true),
		}),
	});

	t.deepEqual(
		schema.resolve(
			{},
			{options: {}},
		),
		{
			options: {enabled: true},
		},
	);
});


test('ObjectSchema.resolve() applies defaults inside a replacement object introduced by a source', t => {
	const schema = Schema.object({
		name: Schema.string(),
		enabled: Schema.boolean().default(true),
	}).replace();

	t.deepEqual(
		schema.resolve(
			{name: 'Target', enabled: false},
			{name: 'Source'},
		),
		{name: 'Source', enabled: true},
	);
});


test('ObjectSchema.resolve() applies defaults to additional properties introduced by sources', t => {
	const schema = Schema.object()
		.additionalProperties(
			Schema.object({
				enabled: Schema.boolean().default(true),
			}),
		);

	t.deepEqual(
		schema.resolve(
			{},
			{first: {}},
			{second: {enabled: false}},
		),
		{
			first: {enabled: true},
			second: {enabled: false},
		},
	);
});



// =============================================================================
// Immutability
// =============================================================================

test('ObjectSchema.resolve() does not modify the target or any source fragment', t => {
	const schema = Schema.object({
		first: Schema.object({
			value: Schema.number().optional(),
		}),
		second: Schema.object({
			value: Schema.number().optional(),
		}),
	});
	const target = {first: {value: 1}};
	const firstSource = {second: {}};
	const secondSource = {second: {value: 2}};

	schema.resolve(target, firstSource, secondSource);

	t.deepEqual(
		target,
		{first: {value: 1}},
	);

	t.deepEqual(
		firstSource,
		{second: {}},
	);

	t.deepEqual(
		secondSource,
		{second: {value: 2}},
	);
});
