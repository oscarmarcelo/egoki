import Schema from '../schemas/schema.js';

import {isPlainObject} from './is.js';
import message from './message.js';



export function assertArray(method, value) {
	if (!Array.isArray(value)) {
		throw new TypeError(
			message(`${method}() expects an array`, value),
		);
	}
}



export function assertBoolean(method, value) {
	if (typeof value !== 'boolean') {
		throw new TypeError(
			message(`${method}() expects a boolean`, value),
		);
	}
}



export function assertPlainObject(method, value) {
	if (!isPlainObject(value)) {
		throw new TypeError(
			message(`${method}() expects a plain object`, value),
		);
	}
}



export function assertProperties(method, properties) {
	assertPlainObject(method, properties);

	for (const [key, schema] of Object.entries(properties)) {
		if (!Schema.isSchema(schema)) {
			throw new TypeError(
				message(
					`${method}() expects every property value to be a Schema at key ${JSON.stringify(key)}`,
					schema,
				),
			);
		}
	}
}



export function assertSchema(method, value) {
	if (!Schema.isSchema(value)) {
		throw new TypeError(
			message(`${method}() expects a Schema`, value),
		);
	}
}



export function assertString(method, value) {
	if (typeof value !== 'string') {
		throw new TypeError(
			message(`${method}() expects a string`, value),
		);
	}
}
