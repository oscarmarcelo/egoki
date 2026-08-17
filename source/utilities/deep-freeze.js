function freeze(value, seen) {
	if (value === null || typeof value !== 'object') {
		return value;
	}

	if (seen.has(value)) {
		return value;
	}

	seen.add(value);

	for (const key of Reflect.ownKeys(value)) {
		freeze(Reflect.get(value, key), seen);
	}

	return Object.freeze(value);
}



export default function deepFreeze(value) {
	return freeze(value, new WeakSet());
}
