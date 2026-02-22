import { defineConfig } from "tsdown";

export default defineConfig({
    entry: ["./src/index.ts"],
    outDir: "./dist",
    clean: true,
    dts: true,
    skipNodeModulesBundle: true,
    tsconfig: "./tsconfig.json",
    format: ['cjs', 'esm'],
    fixedExtension: true,
    platform: 'neutral',
    nodeProtocol: true,
    sourcemap: true,
    external: [],
});