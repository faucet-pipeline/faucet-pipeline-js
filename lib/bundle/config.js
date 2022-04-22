/* eslint-disable object-curly-newline */
"use strict";

let { generateSWCConfig } = require("./swc");
let { loadExtension, abort, repr } = require("faucet-pipeline-core/lib/util");
let commonjs = require("@rollup/plugin-commonjs");
let { nodeResolve } = require("@rollup/plugin-node-resolve");

let MODULE_FORMATS = { // maps faucet identifiers to Rollup identifiers
	esm: true,
	es: "esm", // alias
	es6: "esm", // alias
	umd: true,
	amd: true,
	commonjs: "cjs",
	cjs: false, // deprecated in favor of `commonjs`
	iife: true
};
let NAMELESS_MODULES = new Set(["es", "amd", "cjs"]); // NB: Rollup identifiers

module.exports = generateConfig;

// generates Rollup configuration
// * `externals` determines which modules/packages to exclude from the bundle
//   (e.g. `{ jquery: "jQuery" }` - the key refers to the respective
//   module/package name, the value refers to a corresponding global variable)
// * `format` determines the bundle format: ESM, UMD, AMD, CommonJS or IIFE
//    (case-insensitive, defaults to ESM)
// * `exports` determines the bundle's API, as per the entry point's exported
//   value (if any)
// * `esnext`, if truthy, activates ESNext transpilation
//     * `esnext.browserslist` is the name of the Browserslist group to select -
//       if `false`, this suppresses automatic configuration via Browserslist
//     * `esnext.exclude` is a list of modules for which to skip transpilation
//       (e.g. `esnext: { exclude: ["jquery"] }`, perhaps due to a distribution
//       already optimized for ES5)
// * `jsx`, if truthy, activates JSX transpilation
//     * `jsx.pragma` determines the function to use for JSX expressions
//       (e.g. `jsx: { pragma: "createElement" }`)
//     * `jsx.fragment` determines the function to use for JSX fragments
//       (e.g. `jsx: { fragment: "Fragment" }`)
//     * additionally accepts the same options as `esnext`
// * `typescript`, if truthy, activates TypeScript transpilation - anything
//   other than `true` will be passed through as TypeScript compiler options
// * `sourcemaps`, if truthy, activates inline source-map generation
// * `compact`, if truthy, compresses the bundle's code - see `determineCompacting`
//    for compression levels, determined by the respective value
function generateConfig({ externals, format, exports, // eslint-disable-next-line indent
		esnext, jsx, typescript, // eslint-disable-next-line indent
		sourcemaps, compact }, { browsers }) {
	let cfg = { sourcemap: sourcemaps };
	let plugins = [];
	let extensions = [".js"];

	if(esnext || typescript || jsx) {
		// TODO: Improve error message (correct extension name)
		let { default: swc } = loadExtension("rollup-plugin-swc",
				"failed to activate SWC");

		if(jsx) {
			extensions.push(".jsx");
		}
		if(typescript) {
			extensions.push(".ts");
		}
		let swcConfig = generateSWCConfig({
			esnext,
			typescript,
			jsx,
			sourcemaps,
			browsers
		});
		plugins.push(swc(swcConfig));
	}

	plugins = plugins.concat([
		nodeResolve({ extensions }),
		commonjs({ include: "node_modules/**" })
	]);
	if(compact) {
		cfg.compact = true;
		plugins = plugins.concat(determineCompacting(compact));
	}
	cfg.plugins = plugins;

	cfg.format = determineModuleFormat(format);
	if(exports) {
		if(NAMELESS_MODULES.has(format)) {
			console.error(`WARNING: ${repr(format, false)} bundles ignore ` +
					`${repr("exports", false)} configuration`);
		}
		cfg.name = exports;
	}

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

function determineModuleFormat(format = "esm") {
	format = format.toLowerCase();
	let _format = MODULE_FORMATS[format];
	switch(_format) {
	case undefined:
		return abort(`unrecognized module format: ${repr(format)}`);
	case false:
		console.error(`WARNING: ${repr(format)} is deprecated`);
		return format;
	case true:
		return format;
	default:
		return _format;
	}
}

function determineCompacting(type = true) {
	switch(type) {
	case true: // default
	case "compact":
		return require("rollup-plugin-cleanup")();
	case "minify":
		var options = { compress: false, mangle: false }; // eslint-disable-line no-var
		break;
	case "mangle":
		options = { compress: false, mangle: true };
		break;
	default:
		abort(`unknown compacting option ${type}`);
	}

	let { terser } = loadExtension("rollup-plugin-terser",
			"failed to activate minification", "faucet-pipeline-jsmin");
	return terser(options);
}
