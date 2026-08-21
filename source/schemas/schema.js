import ValidationError from '../errors/validation-error.js';
import {assertBoolean, assertSchema} from '../utilities/assert.js';
import message from '../utilities/message.js';
import {constructionToken, createSchema, getSchemaOptions, getSchemaState, hasSchemaState, initializeSchema} from '../utilities/schema-state.js';
import {applyDefaultsSymbol, extendSymbol, mergeSymbol, validateSymbol} from '../utilities/symbols.js';



const arrayIndexPattern = /^(?:0|[1-9]\d*)$/v;
const schemaTypes = new Set([
	'string',
	'number',
	'boolean',
	'array',
	'object',
	'union',
]);



function normalizePath(method, path) {
	if (path === undefined) {
		return [];
	}

	if (typeof path === 'string') {
		return path.split('.');
	}

	if (!Array.isArray(path)) {
		throw new TypeError(
			message(`${method}() expects a path string or array`, path),
		);
	}

	for (const segment of path) {
		if (typeof segment === 'string') {
			continue;
		}

		if (Number.isSafeInteger(segment) && segment >= 0) {
			continue;
		}

		throw new TypeError(
			message(`${method}() expects path segments to be strings or non-negative integers`, segment, path),
		);
	}

	return path;
}



function getSchemaAt(schema, segments) {
	let currentSchema = schema;

	for (const segment of segments) {
		const {type, options} = getSchemaState(currentSchema);

		if (type === 'object') {
			const properties = options.properties ?? {};
			const key = String(segment);

			if (!Object.hasOwn(properties, key)) {
				return undefined;
			}

			currentSchema = properties[key];
			continue;
		}

		if (type === 'array') {
			const isIndex = (Number.isSafeInteger(segment) && segment >= 0)
				|| (typeof segment === 'string' && arrayIndexPattern.test(segment));

			if (!isIndex || !options.items) {
				return undefined;
			}

			currentSchema = options.items;
			continue;
		}

		return undefined;
	}

	return currentSchema;
}



function collectSchemasAt(schema, segments, results, seen) {
	if (segments.length === 0) {
		if (!seen.has(schema)) {
			seen.add(schema);
			results.push(schema);
		}

		return;
	}

	const {type, options} = getSchemaState(schema);

	if (type === 'union') {
		for (const alternative of options.alternatives) {
			collectSchemasAt(alternative, segments, results, seen);
		}

		return;
	}

	const [segment, ...remaining] = segments;

	if (type === 'object') {
		const properties = options.properties ?? {};
		const key = String(segment);

		if (Object.hasOwn(properties, key)) {
			collectSchemasAt(properties[key], remaining, results, seen);
			return;
		}

		if (hasSchemaState(options.additionalProperties)) {
			collectSchemasAt(options.additionalProperties, remaining, results, seen);
		}

		return;
	}

	if (type === 'array') {
		const isIndex = (Number.isSafeInteger(segment) && segment >= 0)
			|| (typeof segment === 'string' && arrayIndexPattern.test(segment));

		if (isIndex && options.items) {
			collectSchemasAt(options.items, remaining, results, seen);
		}
	}
}



/**
 * Base class for all schema types.
 *
 * Use the factory methods on {@link Schema} to create schema instances.
 *
 * @abstract
 */
export default class Schema {
	/**
	 * Determines whether a value is a schema instance.
	 *
	 * @param {unknown} value - The value to inspect.
	 * @param {string} [type] - Optional schema type to require.
	 *
	 * @returns {boolean} Whether the value is a schema instance.
	 */
	static isSchema(value, type) {
		if (arguments.length > 1) {
			if (typeof type !== 'string' || !schemaTypes.has(type)) {
				throw new TypeError(
					message('Schema.isSchema() expects a valid schema type', type),
				);
			}

			return hasSchemaState(value) && getSchemaState(value).type === type;
		}

		return hasSchemaState(value);
	}


	/**
	 * Creates a base schema instance.
	 *
	 * @internal
	 *
	 * @param {object} token - Internal construction token.
	 * @param {object} [options] - Internal schema configuration.
	 */
	constructor(token, options = {}) {
		if (token !== constructionToken) {
			throw new TypeError('Schema instances must be created through Schema factory methods.');
		}

		initializeSchema(this, new.target, {
			required: true,
			...options,
		});


		Object.freeze(this);
	}


	/**
	 * Returns the schema type.
	 *
	 * @returns {string} The corresponding Schema factory name.
	 */
	get type() {
		return getSchemaState(this).type;
	}


	/**
	 * Returns the schema explicitly configured at a path.
	 *
	 * @param {Array<string|number>|string} [path] - The path to inspect.
	 *
	 * @returns {Schema|undefined} The schema at the path, when one exists.
	 */
	get(path) {
		const segments = normalizePath('get', path);

		return getSchemaAt(this, segments);
	}


	/**
	 * Returns the schemas that may apply at a path.
	 *
	 * @param {Array<string|number>|string} [path] - The path to inspect.
	 *
	 * @returns {Schema[]} The schemas that may apply at the path.
	 */
	getSchemas(path) {
		const segments = normalizePath('getSchemas', path);
		const results = [];

		collectSchemasAt(this, segments, results, new Set());

		return results;
	}


	/**
	 * Configures whether omitted values are accepted.
	 *
	 * @param {boolean} [isRequired = true] - Whether an omitted value is required.
	 *
	 * @returns {this} A new schema with the requested required setting.
	 */
	required(isRequired) {
		if (arguments.length === 0) {
			isRequired = true;
		}

		assertBoolean('required', isRequired);

		return createSchema(this, {
			...getSchemaOptions(this),
			required: isRequired,
		});
	}


	/**
	 * Makes omitted values optional.
	 *
	 * @returns {this} A new optional schema.
	 */
	optional() {
		return this.required(false);
	}


	/**
	 * Configures the default value used for omitted runtime values.
	 *
	 * @param {unknown} value - The default value to be used.
	 *
	 * @returns {this} A new schema with the configured default.
	 *
	 * @throws {TypeError} If the default value does not satisfy the schema.
	 */
	default(value) {
		if (!this.test(value)) {
			throw new TypeError(
				message('default() expects a value that satisfies the schema', value),
			);
		}

		return createSchema(this, {
			...getSchemaOptions(this),
			default: value,
		});
	}


	/**
	 * Creates a schema with the same configuration.
	 *
	 * @returns {this} A distinct schema with equivalent configuration.
	 */
	clone() {
		return createSchema(this, getSchemaOptions(this));
	}


	/**
	 * Configures replacement merging.
	 *
	 * @returns {this} A new schema using the replace strategy.
	 */
	replace() {
		return createSchema(this, {
			...getSchemaOptions(this),
			merge: 'replace',
		});
	}


	/**
	 * Creates a structured validation issue.
	 *
	 * @internal
	 *
	 * @param {Array<string|number>} path - The location of the invalid value.
	 * @param {unknown} value - The invalid value.
	 * @param {string} issueMessage - The issue description.
	 *
	 * @returns {object} The validation issue.
	 */
	createIssue(path, value, issueMessage) {
		return {
			schema: this,
			path,
			value,
			message: issueMessage,
		};
	}


	/**
	 * Extends this schema with another schema of the same type.
	 *
	 * @param {Schema} schema - The schema to extend this schema with.
	 *
	 * @returns {this} A new extended schema.
	 *
	 * @throws {TypeError} If `schema` is not a schema instance or has a different root type.
	 */
	extend(schema) {
		assertSchema('extend', schema);

		if (getSchemaState(schema).Class !== getSchemaState(this).Class) {
			throw new TypeError(
				message('extend() expects a schema of the same type', schema),
			);
		}

		return this[extendSymbol](schema);
	}


	[extendSymbol](schema) {
		return createSchema(this, {
			...getSchemaOptions(this),
			...getSchemaOptions(schema),
		});
	}


	/**
	 * Validates a runtime value.
	 *
	 * @param {unknown} value - The value to validate.
	 *
	 * @returns {unknown} The original value when validation succeeds.
	 *
	 * @throws {ValidationError} If the value does not satisfy the schema.
	 */
	validate(value) {
		const issues = [];

		this[validateSymbol](value, [], issues);

		if (issues.length > 0) {
			throw new ValidationError(issues);
		}

		return value;
	}


	/**
	 * Adds an issue when a required value is omitted.
	 *
	 * @internal
	 *
	 * @param {unknown} value - The value to check.
	 * @param {Array<string|number>} path - The value's path.
	 * @param {object[]} issues - The issue accumulator.
	 *
	 * @returns {boolean} Whether validation should continue for the value.
	 */
	validateRequired(value, path, issues) {
		if (value === undefined) {
			if (getSchemaOptions(this).required) {
				issues.push(this.createIssue(
					path,
					value,
					'Required value',
				));
			}

			return false;
		}

		return true;
	}


	[validateSymbol](value, path, issues) {
		return this.validateRequired(value, path, issues);
	}


	/**
	 * Tests whether a runtime value satisfies the schema.
	 *
	 * @param {unknown} value - The value to test.
	 *
	 * @returns {boolean} Whether the value satisfies the schema.
	 */
	test(value) {
		try {
			this.validate(value);

			return true;
		} catch {
			return false;
		}
	}


	/**
	 * Applies configured defaults to a runtime value.
	 *
	 * @param {unknown} value - The value to default.
	 *
	 * @returns {unknown} The value with applicable defaults applied.
	 *
	 * @throws {ValidationError} If the resulting value does not satisfy the schema.
	 */
	applyDefaults(value) {
		return this.validate(this[applyDefaultsSymbol](value));
	}


	[applyDefaultsSymbol](value) {
		if (value !== undefined) {
			return value;
		}

		return getSchemaOptions(this).default;
	}


	/**
	 * Merges runtime values according to the schema's merge strategy.
	 *
	 * Sources are merged into the target from left to right.
	 * Only the final accumulated result is validated.
	 *
	 * @param {unknown} [target] - The target value.
	 * @param {...unknown} [sources] - The source values.
	 *
	 * @returns {unknown} The merged runtime value.
	 *
	 * @throws {ValidationError} If the final merged value does not satisfy the schema.
	 */
	merge(target, ...sources) {
		let result = target;

		for (const source of sources) {
			result = this[mergeSymbol](result, source);
		}

		return this.validate(result);
	}


	[mergeSymbol](target, source) {
		if (source !== undefined) {
			return source;
		}

		return target;
	}


	/**
	 * Applies defaults, merges runtime values, reapplies defaults, and validates the result.
	 *
	 * Sources are merged into the internally defaulted target from left to right.
	 * Intermediate values are not publicly validated.
	 *
	 * @param {unknown} [target] - The target value.
	 * @param {...unknown} [sources] - The source values.
	 *
	 * @returns {unknown} The validated resolved value.
	 *
	 * @throws {ValidationError} If the final resolved value is invalid.
	 */
	resolve(target, ...sources) {
		let result = this[applyDefaultsSymbol](target);

		for (const source of sources) {
			result = this[mergeSymbol](result, source);
		}

		result = this[applyDefaultsSymbol](result);

		return this.validate(result);
	}
}
