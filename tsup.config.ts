import { defineConfig } from "tsup";

export default defineConfig({
	cjsInterop: true,
	clean: true,
	dts: true,
	entry: ["src/index.ts"],
	external: [/^@google-labs\/.*/],
	format: ["cjs", "esm", "iife"],
	metafile: true,
	shims: true,
	skipNodeModulesBundle: true,
	sourcemap: true,
	splitting: false,
	treeshake: true,
	tsconfig: "tsconfig.json",
});
