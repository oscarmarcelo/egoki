export default function assertTypeError(t, fn, message) {
	const error = t.throws(fn, {
		instanceOf: TypeError,
	});

	if (message !== undefined) {
		t.is(error.message, message);
	}

	return error;
}
