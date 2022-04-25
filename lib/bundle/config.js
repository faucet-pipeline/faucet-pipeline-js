/* eslint-disable object-curly-newline */
"use strict";

let { determinePlugins } = require("./plugins");
let { abort, repr } = require("faucet-pipeline-core/lib/util");
let commonjs = require("@rollup/plugin-commonjs");
let { nodeResolve } = require("@rollup/plugin-node-resolve");

let MODULE_FORMATS = new Map([ // maps faucet identifiers to Rollup identifiers
	["esm", "esm"],
	["umd", "umd"],
	["amd", "amd"],
	["commonjs", "cjs"],
	["iife", "iife"]
]);
let NAMELESS_MODULES = new Set(["esm", "amd", "commonjs"]);

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
	let plugins = [
		nodeResolve({ extensions: determineExtensions(jsx, typescript) }),
		commonjs({ include: "node_modules/**" }),
		...determinePlugins({
			esnext,
			typescript,
			jsx,
			sourcemaps,
			browsers,
			compact
		})
	];

	let config = {
		sourcemap: sourcemaps,
		compact: !!compact,
		plugins,
		format: determineModuleFormat(format)
	};

	if(exports) {
		if(NAMELESS_MODULES.has(format)) {
			console.error(`WARNING: ${repr(format, false)} bundles ignore ` +
					`${repr("exports", false)} configuration`);
		}
		config.name = exports;
	}

	if(externals) { // excluded from bundle
		config.external = Object.keys(externals);
		config.globals = externals;
	}

	// distinguish between (roughly) read and write settings
	let read = ["external", "plugins"];
	return Object.keys(config).reduce((memo, key) => {
		let type = read.includes(key) ? "readConfig" : "writeConfig";
		memo[type][key] = config[key];
		return memo;
	}, {
		readConfig: {},
		writeConfig: { indent: false }
	});
}

function determineModuleFormat(format = "esm") {
	format = format.toLowerCase();

	if(!MODULE_FORMATS.has(format)) {
		return abort(`unrecognized module format: ${repr(format)}`);
	}

	return MODULE_FORMATS.get(format);
}

function determineExtensions(jsx, typescript) {
	let extensions = [".js"];
	if(jsx) {
		extensions.push(".jsx");
	}
	if(typescript) {
		extensions.push(".ts");
	}
	return extensions;
}
