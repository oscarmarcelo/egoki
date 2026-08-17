import message from '../utilities/message.js';



/**
 * Error thrown when a runtime value fails schema validation.
 *
 * @property {object[]} issues - All validation issues.
 * @property {object} issue - The first validation issue.
 *
 * @augments TypeError
 */
export default class ValidationError extends TypeError {
	/**
	 * Creates a validation error from one or more validation issues.
	 *
	 * @param {object[]} [issues] - The list of validation issues.
	 *
	 * @throws {TypeError} If `issues` is not a non-empty array.
	 */
	constructor(issues = []) {
		if (!Array.isArray(issues)) {
			throw new TypeError(
				message('The property `issues` expects an array', issues),
			);
		}

		if (issues.length === 0) {
			throw new TypeError(
				message('The property `issues` must contain at least one issue', issues),
			);
		}

		super(`Validation failed with ${issues.length} issue${issues.length === 1 ? '' : 's'}.`);

		this.name = 'ValidationError';
		this.issues = Object.freeze([...issues]);
	}


	/**
	 * Returns the first validation issue.
	 *
	 * @returns {object} The first validation issue.
	 */
	get issue() {
		return this.issues[0];
	}
}
