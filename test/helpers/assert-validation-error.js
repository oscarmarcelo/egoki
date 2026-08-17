import ValidationError from '../../source/errors/validation-error.js';



export default function assertValidationError(t, fn, message) {
	const error = t.throws(fn, {
		instanceOf: ValidationError,
	});


	if (message !== undefined) {
		t.is(error.message, message);
	}

	return error;
}
