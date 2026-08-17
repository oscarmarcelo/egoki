import message from '../utilities/message.js';
import {getSchemaOptions} from '../utilities/schema-state.js';
import {mergeSymbol} from '../utilities/symbols.js';



function getKey(item, key) {
	if (
		item === null
		|| (
			typeof item !== 'object'
			&& typeof item !== 'function'
		)
		|| !Object.hasOwn(item, key)
	) {
		throw new TypeError(
			message(`keyedBy(${JSON.stringify(key)}) expects every item to have the merge key`, item),
		);
	}

	return item[key];
}



function indexItems(items, key) {
	const map = new Map();

	for (const [index, item] of items.entries()) {
		const itemKey = getKey(item, key);

		if (map.has(itemKey)) {
			throw new TypeError(
				message(`keyedBy(${JSON.stringify(key)}) expects unique merge keys`, itemKey),
			);
		}

		map.set(itemKey, index);
	}

	return map;
}



export default function keyed(schema, target, source) {
	if (
		!Array.isArray(target)
		&& target !== undefined
	) {
		throw new TypeError(
			message('keyedBy() merge strategy expects the target to be an array', target),
		);
	}

	if (!Array.isArray(source)) {
		throw new TypeError(
			message('keyedBy() merge strategy expects the source to be an array', source),
		);
	}

	const {items, key} = getSchemaOptions(schema);

	indexItems(source, key);

	if (target === undefined) {
		return source;
	}

	const result = [...target];
	const targetMap = indexItems(result, key);

	for (const item of source) {
		const itemKey = getKey(item, key);

		if (targetMap.has(itemKey)) {
			const index = targetMap.get(itemKey);

			result[index] = items
				? items[mergeSymbol](result[index], item)
				: item;

			continue;
		}

		targetMap.set(itemKey, result.length);

		result.push(item);
	}


	return result;
}
