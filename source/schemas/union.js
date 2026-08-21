import {createSchema, getSchemaOptions, getSchemaState} from '../utilities/schema-state.js';
import {applyDefaultsSymbol, extendSymbol, validateSymbol} from '../utilities/symbols.js';

import Schema from './schema.js';



/**
 * Schema accepting values that satisfy at least one alternative schema.
 *
 * @augments Schema
 */
export default class UnionSchema extends Schema {
	static schemaType = 'union';

	/**
	 * Creates a schema instance.
	 *
	 * @internal
	 *
	 * @param {object} token - Internal construction token.
	 * @param {object} options - Internal schema configuration.
	 */
	constructor(token, options) {
		super(token, {
			merge: 'replace',
			...options,
		});
	}


	[extendSymbol](schema) {
		const baseOptions = getSchemaOptions(this);
		const extensionOptions = getSchemaOptions(schema);
		const options = {
			...baseOptions,
			...extensionOptions,
		};

		const baseAlternatives = baseOptions.alternatives;
		const extensionAlternatives = extensionOptions.alternatives;

		if (
			baseAlternatives.length === extensionAlternatives.length
			&& baseAlternatives.every((alternative, index) => (
				getSchemaState(alternative).Class === getSchemaState(extensionAlternatives[index]).Class
			))
		) {
			options.alternatives = baseAlternatives.map((alternative, index) => (
				alternative.extend(extensionAlternatives[index])
			));
		}

		return createSchema(this, options);
	}


	[validateSymbol](value, path, issues) {
		if (!super[validateSymbol](value, path, issues)) {
			return;
		}

		const {alternatives} = getSchemaOptions(this);

		for (const alternative of alternatives) {
			const alternativeIssues = [];
			alternative[validateSymbol](value, path, alternativeIssues);

			if (alternativeIssues.length === 0) {
				return;
			}
		}

		issues.push(this.createIssue(
			path,
			value,
			'Expected a value satisfying at least one schema',
		));
	}


	[applyDefaultsSymbol](value) {
		value = super[applyDefaultsSymbol](value);

		if (value === undefined) {
			return value;
		}

		const {alternatives} = getSchemaOptions(this);

		for (const alternative of alternatives) {
			const result = alternative[applyDefaultsSymbol](value);
			const issues = [];

			alternative[validateSymbol](result, [], issues);

			if (issues.length === 0) {
				return result;
			}
		}

		return value;
	}
}
