export default [
	{
		rules: {
			'@stylistic/function-paren-newline': 'off', // TODO: [eslint-config-xo@>=0.58] Awaiting for this version which reverts this rule.
			'@stylistic/no-multiple-empty-lines': [
				'warn',
				{
					max: 3,
				},
			],
			'@stylistic/object-curly-newline': [
				'error',
				{
					ImportDeclaration: 'never',
				},
			],
			'import-x/order': [
				'error',
				{
					'newlines-between': 'always',
					alphabetize: {
						order: 'asc',
					},
					named: true,
				},
			],
			'jsdoc/require-asterisk-prefix': [
				'error',
				'always',
			],
			'no-console': [
				'warn',
				{
					allow: [
						'warn',
						'error',
					],
				},
			],
		},
	},
	{
		files: ['**/*.md'],
		rules: {
			'jsdoc/require-asterisk-prefix': 'off', // Seems to be buggy with Markdown files.
		},
	},
];
