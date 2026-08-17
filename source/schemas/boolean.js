import message from '../utilities/message.js';
import {validateSymbol} from '../utilities/symbols.js';

import PrimitiveSchema from './primitive.js';



/**
 * Schema for JavaScript boolean values.
 *
 * @augments PrimitiveSchema
 */
export default class BooleanSchema extends PrimitiveSchema {
	/**
	 * Creates a schema instance.
	 *
	 * @internal
	 *
	 * @param {object} token - Internal construction token.
	 * @param {object} [options] - Internal schema configuration.
	 */
	constructor(token, options = {}) {
		super(token, {
			...options,
		});
	}


	/**
	 * Checks whether a value has the schema's primitive runtime type.
	 *
	 * @internal
	 *
	 * @param {unknown} value - The value to check.
	 * @param {string} [method = 'assertType'] - The method to identify in the error message.
	 *
	 * @throws {TypeError} If the value has the wrong type.
	 */
	assertType(value, method = 'assertType') {
		if (typeof value !== 'boolean') {
			throw new TypeError(
				message(`${method}() expects a boolean`, value),
			);
		}
	}


	[validateSymbol](value, path, issues) {
		if (!super[validateSymbol](value, path, issues)) {
			return;
		}

		if (typeof value !== 'boolean') {
			issues.push(this.createIssue(
				path,
				value,
				'Expected a boolean',
			));

			return;
		}

		this.validateEnum(value, path, issues);
	}
}
