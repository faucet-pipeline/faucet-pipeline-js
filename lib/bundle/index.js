"use strict";

// let { generateError } = require("../util");
let esbuild = require("esbuild");

module.exports = class Bundle {
	// XXX: I did not do anything to activate TypeScript support?
	constructor(entryPoint, target, { fingerprint, sourcemaps, compact, jsx }) {
		this.target = target;
		this.fingerprint = fingerprint;

		this.config = {
			entryPoints: [entryPoint],
			bundle: true,
			format: "esm",
			write: false,
			charset: "utf8",
			sourcemap: sourcemaps ? "inline" : false,
			minifyWhitespace: !!compact,
			outdir: "out",
			jsxFactory: jsx && jsx.pragma,
			jsxFragment: jsx && jsx.fragment,
			jsxSideEffects: true // suppresses /* @__PURE__ */ comments
		};
	}

	// TODO: only rebuild when relevant files changed
	// TODO: handle errors
	// compiles the bundle - if a list of file paths is provided, compilation
	// will be aborted unless the dependency graph includes any of those files
	async compile(filepaths) {
		let result = await esbuild.build(this.config);

		return {
			code: result.outputFiles[0].text
		};
	}
};
