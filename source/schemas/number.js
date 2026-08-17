import message from '../utilities/message.js';
import {validateSymbol} from '../utilities/symbols.js';

import PrimitiveSchema from './primitive.js';



/**
 * Schema for JavaScript number values.
 *
 * @augments PrimitiveSchema
 */
export default class NumberSchema extends PrimitiveSchema {
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
		if (typeof value !== 'number') {
			throw new TypeError(
				message(`${method}() expects a number`, value),
			);
		}
	}


	[validateSymbol](value, path, issues) {
		if (!super[validateSymbol](value, path, issues)) {
			return;
		}

		if (typeof value !== 'number') {
			issues.push(this.createIssue(
				path,
				value,
				'Expected a number',
			));

			return;
		}

		this.validateEnum(value, path, issues);
	}
}
