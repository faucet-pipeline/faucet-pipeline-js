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
// * `transpiler.features` determines the language features to be supported
//   within source code (e.g. `["es2015", "jsx"]`)
// * `transpiler.jsx` are JSX-specific options (e.g. `{ pragma: "createElement" }`)
// * `transpiler.exclude` is a list of modules for which to skip transpilation
//   (e.g. `["jquery"]`, perhaps due to an already optimized ES5 distribution)
// * `compact`, if truthy, compresses the bundle's code while retaining the
//   source code's original structure
function generateConfig({ extensions = [], // eslint-disable-next-line indent
		externals, format, moduleName, transpiler, compact }) {
	let plugins = [];
	if(transpiler) {
		let { plugin, extensions: ext } = generateTranspiler(transpiler);
		extensions = ext.concat(extensions);
		plugins.push(plugin);
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
		let cleanup = requireOptional("rollup-plugin-cleanup",
				"failed to activate compacting");
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
			intro: GLOBAL_SHIM // cf. http://2ality.com/2016/09/global.html
		}
	});
}
