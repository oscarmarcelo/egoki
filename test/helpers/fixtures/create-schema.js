import Schema from '../../../source/index.js';



export function createSinglePropertyObjectSchema() {
	return Schema.object().properties({
		name: Schema.string(),
	});
}



export function createSinglePropertyObjectArraySchema() {
	return Schema.array()
		.items(
			Schema.object()
				.properties({
					name: Schema.string(),
				}),
		);
}


export function createKeyedObjectSchema() {
	return Schema.object().properties({
		id: Schema.number(),
		name: Schema.string(),
	});
}
