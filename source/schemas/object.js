import {assertProperties, assertSchema} from '../utilities/assert.js';
import {isPlainObject} from '../utilities/is.js';
import mergeWithStrategy from '../utilities/merge-with-strategy.js';
import {createSchema, getSchemaOptions} from '../utilities/schema-state.js';
import {applyDefaultsSymbol, mergeSymbol, validateSymbol} from '../utilities/symbols.js';

import Schema from './schema.js';



/**
 * Schema for JavaScript plain object values.
 *
 * @augments Schema
 */
export default class ObjectSchema extends Schema {
	/**
	 * Creates a schema instance.
	 *
	 * @internal
	 *
	 * @param {object} token - Internal construction token.
	 * @param {object} [options] - Internal schema configuration.
	 */
	constructor(token, options = {}) {
		if (Object.hasOwn(options, 'properties')) {
			assertProperties('properties', options.properties);
		}

		super(token, {
			merge: 'deep',
			...options,
		});
	}


	/**
	 * Configures the schemas for declared object properties.
	 *
	 * @param {Record<string, Schema>} properties - The declared property schemas.
	 *
	 * @returns {this} A new object schema with the configured properties.
	 *
	 * @throws {TypeError} If `properties` is invalid or the resulting schema would have an invalid configured default.
	 */
	properties(properties) {
		assertProperties('properties', properties);

		return createSchema(this, {
			...getSchemaOptions(this),
			properties,
		});
	}


	/**
	 * Configures how undeclared object properties are handled.
	 *
	 * @param {Schema|boolean} schema - A schema, or `true`/`false` to allow or reject them.
	 *
	 * @returns {this} A new object schema with the configured additional-property behavior.
	 *
	 * @throws {TypeError} If `schema` is neither a schema instance nor a boolean, or the resulting schema would have an invalid configured default.
	 */
	additionalProperties(schema) {
		if (typeof schema === 'boolean') {
			return createSchema(this, {
				...getSchemaOptions(this),
				additionalProperties: schema,
			});
		}

		assertSchema('additionalProperties', schema);

		return createSchema(this, {
			...getSchemaOptions(this),
			additionalProperties: schema,
		});
	}


	/**
	 * Configures recursive object merging.
	 *
	 * @returns {this} A new object schema using the deep strategy.
	 */
	deep() {
		return createSchema(this, {
			...getSchemaOptions(this),
			merge: 'deep',
		});
	}


	[validateSymbol](value, path, issues) {
		if (!super[validateSymbol](value, path, issues)) {
			return;
		}

		if (!isPlainObject(value)) {
			issues.push(this.createIssue(
				path,
				value,
				'Expected a plain object',
			));

			return;
		}

		const {
			additionalProperties = true,
			properties = {},
		} = getSchemaOptions(this);

		for (const [key, schema] of Object.entries(properties)) {
			schema[validateSymbol](
				value[key],
				[...path, key],
				issues,
			);
		}

		for (const [key, propertyValue] of Object.entries(value)) {
			if (Object.hasOwn(properties, key)) {
				continue;
			}

			if (additionalProperties === true) {
				continue;
			}

			if (additionalProperties === false) {
				issues.push(this.createIssue(
					[...path, key],
					propertyValue,
					'Unexpected property',
				));

				continue;
			}

			additionalProperties[validateSymbol](
				propertyValue,
				[...path, key],
				issues,
			);
		}
	}


	[applyDefaultsSymbol](value) {
		value = super[applyDefaultsSymbol](value);

		if (value === undefined || !isPlainObject(value)) {
			return value;
		}

		let result = value;

		function ensureClone() {
			if (result === value) {
				result = Object.assign(
					Object.create(Object.getPrototypeOf(value)),
					value,
				);
			}
		}

		const {
			additionalProperties,
			properties = {},
		} = getSchemaOptions(this);

		for (const [key, schema] of Object.entries(properties)) {
			const property = result[key];
			const next = schema[applyDefaultsSymbol](property);

			if (next !== property) {
				ensureClone();
				result[key] = next;
			}
		}

		if (Schema.isSchema(additionalProperties)) {
			for (const [key, property] of Object.entries(result)) {
				if (Object.hasOwn(properties, key)) {
					continue;
				}

				const next = additionalProperties[applyDefaultsSymbol](property);

				if (next !== property) {
					ensureClone();
					result[key] = next;
				}
			}
		}

		return result;
	}


	[mergeSymbol](target, source) {
		source = super[mergeSymbol](target, source);

		if (source === target) {
			return target;
		}

		return mergeWithStrategy(this, target, source);
	}
}
