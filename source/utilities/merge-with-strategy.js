import mergeStrategies from '../merge-strategies/index.js';

import message from './message.js';
import {getSchemaOptions} from './schema-state.js';



export default function mergeWithStrategy(schema, target, source) {
	const {merge} = getSchemaOptions(schema);
	const strategy = mergeStrategies[merge];

	/* c8 ignore next 5 -- Merge strategies are currently predefined. */
	if (!strategy) {
		throw new TypeError(
			message('Unknown merge strategy', merge),
		);
	}

	return strategy(
		schema,
		target,
		source,
	);
}
