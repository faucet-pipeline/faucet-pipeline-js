/* eslint-disable object-curly-newline */
"use strict";

let { loadExtension, abort } = require("faucet-pipeline-core/lib/util");
let commonjs = require("@rollup/plugin-commonjs");
let { nodeResolve } = require("@rollup/plugin-node-resolve");

module.exports = generateConfig;

// generates Rollup configuration
// * `externals` determines which modules/packages to exclude from the bundle
//   (e.g. `{ jquery: "jQuery" }` - the key refers to the respective
//   module/package name, the value refers to a corresponding global variable)
// * `typescript`, if truthy, activates TypeScript transpilation - anything
//   other than `true` will be passed through as TypeScript compiler options
// * `sourcemaps`, if truthy, activates inline source-map generation
// * `compact`, if truthy, compresses the bundle's code - see `determineCompacting`
//    for compression levels, determined by the respective value
async function generateConfig({ externals, typescript, sourcemaps, compact }) {
	let cfg = { sourcemap: sourcemaps };
	let plugins = [];
	let extensions = [".js"];

	if(typescript) {
		let ts = await loadExtension("@rollup/plugin-typescript",
				"failed to activate TypeScript", "faucet-pipeline-typescript");
		extensions.push(".ts");
		// TODO: provide defaults and abstractions for low-level options?
		plugins.push(typescript === true ? ts() : ts(typescript));
	}

	plugins = plugins.concat([
		nodeResolve({ extensions }),
		commonjs({ include: "node_modules/**" })
	]);
	if(compact) {
		cfg.compact = true;
		plugins = plugins.concat(await determineCompacting(compact));
	}
	cfg.plugins = plugins;

	cfg.format = "esm";

	if(externals) { // excluded from bundle
		cfg.external = Object.keys(externals);
		cfg.globals = externals;
	}

	// distinguish between (roughly) read and write settings
	let read = ["external", "plugins"];
	return Object.keys(cfg).reduce((memo, key) => {
		let type = read.includes(key) ? "readConfig" : "writeConfig";
		memo[type][key] = cfg[key];
		return memo;
	}, {
		readConfig: {},
		writeConfig: { indent: false }
	});
}

async function determineCompacting(type = true) {
	switch(type) {
	case true: // default
	case "compact":
		return require("rollup-plugin-cleanup")();
	case "minify":
		var options = { compress: false, mangle: false }; // eslint-disable-line no-var
		break;
	default:
		abort(`unknown compacting option ${type}`);
	}

	let terser = await loadExtension("@rollup/plugin-terser",
			"failed to activate minification", "faucet-pipeline-jsmin");
	return terser(options);
}
