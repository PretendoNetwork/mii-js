import eslintConfig from '@pretendonetwork/eslint-config';

export default [
	...eslintConfig,
	{
		ignores: [
			'examples/*'
		]
	}
];
