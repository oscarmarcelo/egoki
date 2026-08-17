import message from '../utilities/message.js';



export default function append(_schema, target, source) {
	if (target === undefined) {
		return source;
	}

	if (!Array.isArray(target)) {
		throw new TypeError(
			message('append() merge strategy expects the target to be an array', target),
		);
	}

	if (!Array.isArray(source)) {
		throw new TypeError(
			message('append() merge strategy expects the source to be an array', source),
		);
	}

	return [
		...target,
		...source,
	];
}
