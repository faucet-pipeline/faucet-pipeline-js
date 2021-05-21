"use strict";

let esbuild = require("esbuild");
let { abort } = require("faucet-pipeline-core/lib/util");

module.exports = class Bundle {
	constructor(entryPoint, target, { format, fingerprint, compact, jsx }) {
		if(format && format !== "esm") {
			abort(`Unsupported format ${format}`);
		}

		this.target = target;
		this.fingerprint = fingerprint;

		this.config = {
			entryPoints: [entryPoint],
			bundle: true,
			format: "esm",
			write: false,
			charset: "utf8",
			metafile: true,
			minifyWhitespace: !!compact,
			minifyIdentifiers: compact === "mangle",
			outdir: "out",
			jsxFactory: jsx && jsx.pragma,
			jsxFragment: jsx && jsx.fragment
		};
	}

	// TODO: skip if files are not relevant
	// via: Object.keys(res.metafile.inputs);
	async compile(filepaths) {
		let result = esbuild.buildSync(this.config);

		// TODO: write error if error occurred
		// TODO: outputFiles is an array of all files that would have been written
		return {
			code: result.outputFiles[0].text
		};
	}
};
