import ArraySchema from './schemas/array.js';
import BooleanSchema from './schemas/boolean.js';
import NumberSchema from './schemas/number.js';
import ObjectSchema from './schemas/object.js';
import BaseSchema from './schemas/schema.js';
import StringSchema from './schemas/string.js';
import {assertProperties, assertSchema} from './utilities/assert.js';
import {constructionToken} from './utilities/schema-state.js';

/**
 * @typedef {import('./schemas/schema.js').default} SchemaInstance
 */



/**
 * Factory and utility methods for creating and inspecting schemas.
 *
 * @namespace Schema
 */
const Schema = {

	/**
	 * Creates a string schema.
	 *
	 * @returns {StringSchema} A new string schema.
	 */
	string() {
		return new StringSchema(constructionToken);
	},


	/**
	 * Creates a number schema.
	 *
	 * @returns {NumberSchema} A new number schema.
	 */
	number() {
		return new NumberSchema(constructionToken);
	},


	/**
	 * Creates a boolean schema.
	 *
	 * @returns {BooleanSchema} A new boolean schema.
	 */
	boolean() {
		return new BooleanSchema(constructionToken);
	},


	/**
	 * Creates an object schema.
	 *
	 * @param {Record<string, SchemaInstance>} [properties] - Declared property schemas.
	 *
	 * @returns {ObjectSchema} A new object schema.
	 */
	object(properties) {
		const configuration = {};

		if (arguments.length > 0) {
			assertProperties('Schema.object', properties);
			configuration.properties = properties;
		}

		return new ObjectSchema(constructionToken, configuration);
	},


	/**
	 * Creates an array schema.
	 *
	 * @param {SchemaInstance} [items] - Schema used for array items.
	 *
	 * @returns {ArraySchema} A new array schema.
	 */
	array(items) {
		const configuration = {};

		if (arguments.length > 0) {
			assertSchema('Schema.array', items);
			configuration.items = items;
		}

		return new ArraySchema(constructionToken, configuration);
	},


	/**
	 * Determines whether a value is a schema instance.
	 *
	 * @param {unknown} value - The value to inspect.
	 *
	 * @returns {boolean} Whether the value is a schema instance.
	 */
	isSchema: BaseSchema.isSchema,
};



export default Schema;
export {Schema};
export {default as ValidationError} from './errors/validation-error.js';
