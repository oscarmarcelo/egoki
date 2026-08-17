import Schema from '../../../source/index.js';



const schemas = {
	string: () => Schema.string(),
	number: () => Schema.number(),
	boolean: () => Schema.boolean(),
	array: () => Schema.array(
		Schema.string(),
	),
	object: () => Schema.object(),
};



export default schemas;
