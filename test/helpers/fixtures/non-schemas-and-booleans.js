import nonSchemas from './non-schemas.js';



const nonSchemasAndBooleans = nonSchemas.filter(value =>
	value !== true && value !== false,
);



export default nonSchemasAndBooleans;
