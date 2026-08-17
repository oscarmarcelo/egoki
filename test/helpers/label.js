export default function label(value) {
	switch (typeof value) {
		case 'undefined': {
			return 'undefined';
		}

		case 'boolean': {
			return String(value);
		}

		case 'number': {
			if (Number.isNaN(value)) {
				return 'NaN';
			}

			return String(value);
		}

		case 'bigint': {
			return `${value}n`;
		}

		case 'string': {
			return JSON.stringify(value);
		}

		case 'symbol': {
			return String(value);
		}

		case 'function': {
			return '[Function]';
		}

		default: {
			if (value === null) {
				return 'null';
			}

			if (Array.isArray(value)) {
				return '[Array]';
			}

			return `[${value.constructor?.name ?? 'Object'}]`;
		}
	}
}
