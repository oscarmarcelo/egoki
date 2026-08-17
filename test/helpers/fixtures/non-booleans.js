const nonBooleans = [
	undefined,
	null,
	0,
	1,
	0n,
	1n,
	'',
	'true',
	Symbol('symbol'),
	[],
	{},
	() => {},
];



export default nonBooleans;
