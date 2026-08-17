import deepFreeze from './deep-freeze.js';
import message from './message.js';



const states = new WeakMap();

export const constructionToken = Object.freeze({});



export function initializeSchema(schema, Class, options) {
	states.set(schema, {
		Class,
		options: deepFreeze(options),
	});
}



export function hasSchemaState(schema) {
	return states.has(schema);
}



export function getSchemaState(schema) {
	const state = states.get(schema);

	if (!state) {
		throw new TypeError('Invalid Schema instance.');
	}

	return state;
}



export function getSchemaOptions(schema) {
	return getSchemaState(schema).options;
}



export function createSchema(schema, options) {
	const {Class} = getSchemaState(schema);

	const result = new Class(constructionToken, options);

	if (
		Object.hasOwn(options, 'default')
		&& !result.test(options.default)
	) {
		throw new TypeError(
			message('The configured default value does not satisfy the schema', options.default),
		);
	}

	return result;
}
