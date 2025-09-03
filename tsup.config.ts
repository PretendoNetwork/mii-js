import { defineConfig } from 'tsup';

export default defineConfig({
	entry: ['src/mii.ts'],
	platform: 'node',
	clean: true,
	dts: true,
	format: ['esm', 'cjs']
});
