import {assertSchema, assertString} from '../utilities/assert.js';
import mergeWithStrategy from '../utilities/merge-with-strategy.js';
import message from '../utilities/message.js';
import {createSchema, getSchemaOptions, getSchemaState} from '../utilities/schema-state.js';
import {applyDefaultsSymbol, extendSymbol, mergeSymbol, validateSymbol} from '../utilities/symbols.js';

import Schema from './schema.js';



/**
 * Schema for JavaScript array values.
 *
 * @augments Schema
 */
export default class ArraySchema extends Schema {
	static schemaType = 'array';

	/**
	 * Creates a schema instance.
	 *
	 * @internal
	 *
	 * @param {object} token - Internal construction token.
	 * @param {object} [options] - Internal schema configuration.
	 */
	constructor(token, options = {}) {
		if (Object.hasOwn(options, 'items')) {
			assertSchema('items', options.items);
		}

		super(token, {
			merge: 'replace',
			...options,
		});
	}


	/**
	 * Configures the schema used for array items.
	 *
	 * @param {Schema} schema - The item schema.
	 *
	 * @returns {this} A new array schema with the configured item schema.
	 *
	 * @throws {TypeError} If `schema` is not a schema instance or the resulting schema would have an invalid configured default.
	 */
	items(schema) {
		assertSchema('items', schema);

		return createSchema(this, {
			...getSchemaOptions(this),
			items: schema,
		});
	}


	/**
	 * Configures append merging.
	 *
	 * @returns {this} A new array schema using the append strategy.
	 */
	append() {
		return createSchema(this, {
			...getSchemaOptions(this),
			merge: 'append',
		});
	}


	/**
	 * Configures prepend merging.
	 *
	 * @returns {this} A new array schema using the prepend strategy.
	 */
	prepend() {
		return createSchema(this, {
			...getSchemaOptions(this),
			merge: 'prepend',
		});
	}


	/**
	 * Configures keyed merging for array items.
	 *
	 * @param {string} key - The property used to identify matching items.
	 *
	 * @returns {this} A new array schema using keyed merging.
	 *
	 * @throws {TypeError} If `key` is not a non-empty string.
	 */
	keyedBy(key) {
		assertString('keyedBy', key);

		if (key.length === 0) {
			throw new TypeError(
				message('keyedBy() expects a non-empty string', key),
			);
		}

		return createSchema(this, {
			...getSchemaOptions(this),
			merge: 'keyed',
			key,
		});
	}


	[extendSymbol](schema) {
		const baseOptions = getSchemaOptions(this);
		const extensionOptions = getSchemaOptions(schema);
		const options = {
			...baseOptions,
			...extensionOptions,
		};

		if (
			baseOptions.items
			&& extensionOptions.items
			&& getSchemaState(baseOptions.items).Class === getSchemaState(extensionOptions.items).Class
		) {
			options.items = baseOptions.items.extend(extensionOptions.items);
		}

		return createSchema(this, options);
	}


	[validateSymbol](value, path, issues) {
		if (!super[validateSymbol](value, path, issues)) {
			return;
		}

		if (!Array.isArray(value)) {
			issues.push(this.createIssue(
				path,
				value,
				'Expected an array',
			));

			return;
		}

		const {items} = getSchemaOptions(this);

		if (items) {
			for (const [index, item] of value.entries()) {
				items[validateSymbol](
					item,
					[...path, index],
					issues,
				);
			}
		}
	}


	[applyDefaultsSymbol](value) {
		value = super[applyDefaultsSymbol](value);

		if (value === undefined || !Array.isArray(value)) {
			return value;
		}

		const {items} = getSchemaOptions(this);

		if (!items) {
			return value;
		}

		let result = value;

		for (const [index, item] of value.entries()) {
			const next = items[applyDefaultsSymbol](item);

			if (next !== item) {
				if (result === value) {
					result = [...value];
				}

				result[index] = next;
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
