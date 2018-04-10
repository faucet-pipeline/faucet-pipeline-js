"use strict";

let generateTranspiler = require("./babel");
let { requireOptional } = require("../util");
let commonjs = require("rollup-plugin-commonjs");
let nodeResolve = require("rollup-plugin-node-resolve");

let GLOBAL_SHIM = `
if(typeof global === "undefined" && typeof window !== "undefined") {
	window.global = window;
}`.trim();

module.exports = generateConfig;

// generates Rollup configuration
// * `extensions` is a list of additional file extensions for loading modules
//   (e.g. `[".jsx"]`)
// * `externals` determines which modules/packages to exclude from the bundle
//   (e.g. `{ jquery: "jQuery" }` - the key refers to the respective
//   module/package name, the value refers to a corresponding global variable)
// * `format` determines the bundle format (defaults to IIFE); cf.
//   https://github.com/rollup/rollup/wiki/JavaScript-API#format
// * `moduleName` determines the global variable to hold the entry point's
//   exports (if any)
// * `esnext`, if truthy, activates ESNext transpilation
//     * `esnext.browserslist` is the name of the Browserslist group to select -
//       if `false`, this suppresses automatic configuration via Browserslist
//     * `esnext.exclude` is a list of modules for which to skip transpilation
//       (e.g. `esnext: { exclude: ["jquery"] }`, perhaps due to a distribution
//       already optimized for ES5)
// * `jsx`, if truthy, activates JSX transpilation
//     * `jsx.pragma` determines the function to use for JSX expressions
//       (e.g. `jsx: { pragma: "createElement" }`)
//     * additionally accepts the same options as `esnext`
// * `typescript`, if truthy, activates TypeScript transpilation - anything
//   other than `true` will be passed through as TypeScript compiler options
// * `compact`, if truthy, compresses the bundle's code while retaining the
//   source code's original structure
function generateConfig({ extensions = [], externals, format, moduleName,
		esnext, jsx, typescript, compact }, { browsers, resolvePath }) {
	let plugins = [];
	if(esnext || jsx) {
		let transpiler = Object.assign({}, esnext, jsx);
		if(esnext) {
			transpiler.esnext = true;
		}
		if(jsx) {
			delete transpiler.pragma; // just to be safe, clean up JSX-specifics
			transpiler.jsx = jsx;
		}

		let { browserslist } = transpiler;
		browsers = browserslist === false ? null : browsers[browserslist || "defaults"];
		if(browsers && browsers.length) {
			console.error("transpiling JavaScript for", browsers.join(", "));
		}

		let { plugin, extensions: ext } = generateTranspiler(transpiler, { browsers });
		extensions = ext.concat(extensions);
		plugins.push(plugin);
	}
	if(typescript) {
		let ts = requireOptional("rollup-plugin-typescript2",
				"failed to activate TypeScript", "faucet-pipeline-typescript");
		extensions.push(".ts");
		// TODO: provide defaults and abstractions for low-level options?
		plugins.push(typescript === true ? ts() : ts(typescript));
	}

	let resolve = { jsnext: true };
	if(extensions.length) {
		resolve.extensions = [".js"].concat(extensions);
	}

	plugins = plugins.concat([
		nodeResolve(resolve),
		commonjs({ include: "node_modules/**" })
	]);
	if(compact) {
		let cleanup = require("rollup-plugin-cleanup");
		plugins = plugins.concat(cleanup());
	}

	let cfg = { format, plugins };
	if(moduleName) {
		cfg.name = moduleName;
	}

	if(externals) { // excluded from bundle
		cfg.external = Object.keys(externals);
		cfg.globals = externals;
	}

	// distinguish between (roughly) read and write settings
	let read = ["external", "paths", "plugins"];
	return Object.keys(cfg).reduce((memo, key) => {
		let type = read.includes(key) ? "readConfig" : "writeConfig";
		memo[type][key] = cfg[key];
		return memo;
	}, {
		readConfig: {},
		writeConfig: {
			intro: GLOBAL_SHIM, // cf. http://2ality.com/2016/09/global.html
			indent: false
		}
	});
}
