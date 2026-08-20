import ValidationError from '../errors/validation-error.js';
import {assertBoolean, assertSchema} from '../utilities/assert.js';
import message from '../utilities/message.js';
import {constructionToken, createSchema, getSchemaOptions, getSchemaState, hasSchemaState, initializeSchema} from '../utilities/schema-state.js';
import {applyDefaultsSymbol, extendSymbol, mergeSymbol, validateSymbol} from '../utilities/symbols.js';



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
	 *
	 * @returns {boolean} Whether the value is a schema instance.
	 */
	static isSchema(value) {
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
