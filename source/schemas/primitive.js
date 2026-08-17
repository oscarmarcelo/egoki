import {assertArray} from '../utilities/assert.js';
import message from '../utilities/message.js';
import {createSchema, getSchemaOptions} from '../utilities/schema-state.js';

import Schema from './schema.js';



/**
 * Base class for primitive schemas.
 *
 * @augments Schema
 *
 * @abstract
 */
export default class PrimitiveSchema extends Schema {
	/**
	 * Restricts primitive runtime values to an allowed set.
	 *
	 * @param {unknown[]} values - The allowed values.
	 *
	 * @returns {this} A new schema with the configured enum.
	 *
	 * @throws {TypeError} If the enum is invalid for the schema.
	 */
	enum(values) {
		assertArray('enum', values);

		if (values.length === 0) {
			throw new TypeError(
				message('enum() expects a non-empty array', values),
			);
		}

		const seen = new Set();

		for (const value of values) {
			this.assertType(value, 'enum');

			if (seen.has(value)) {
				throw new TypeError(
					message('enum() expects unique values', value),
				);
			}

			seen.add(value);
		}

		const options = getSchemaOptions(this);

		if (
			Object.hasOwn(options, 'default')
			&& !values.includes(options.default)
		) {
			throw new TypeError(
				message('enum() expects the existing default value to be included in the enum', options.default),
			);
		}

		return createSchema(this, {
			...options,
			enum: [...values],
		});
	}


	/**
	 * Adds an issue when a value is outside the configured enum.
	 *
	 * @internal
	 *
	 * @param {unknown} value - The value to check.
	 * @param {Array<string|number>} path - The value's path.
	 * @param {object[]} issues - The issue accumulator.
	 *
	 * @returns {boolean} Whether the value satisfies the enum constraint.
	 */
	validateEnum(value, path, issues) {
		const options = getSchemaOptions(this);

		if (
			options.enum
			&& !options.enum.includes(value)
		) {
			issues.push(this.createIssue(
				path,
				value,
				'Expected one of the allowed values',
			));

			return false;
		}

		return true;
	}
}
