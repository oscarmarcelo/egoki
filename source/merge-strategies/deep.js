import Schema from '../schemas/schema.js';
import {isPlainObject} from '../utilities/is.js';
import {getSchemaOptions} from '../utilities/schema-state.js';
import {mergeSymbol} from '../utilities/symbols.js';



export default function deep(schema, target, source) {
	if (!isPlainObject(target)) {
		return source;
	}

	if (!isPlainObject(source)) {
		return source;
	}

	const result = {
		...target,
		...source,
	};

	const {
		additionalProperties,
		properties = {},
	} = getSchemaOptions(schema);

	for (const [key, childSchema] of Object.entries(properties)) {
		result[key] = childSchema[mergeSymbol](
			target[key],
			source[key],
		);
	}

	if (Schema.isSchema(additionalProperties)) {
		const keys = new Set([
			...Object.keys(target),
			...Object.keys(source),
		]);

		for (const key of keys) {
			if (Object.hasOwn(properties, key)) {
				continue;
			}

			result[key] = additionalProperties[mergeSymbol](
				target[key],
				source[key],
			);
		}
	}

	return result;
}
