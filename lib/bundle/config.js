"use strict";

let commonjs = require("rollup-plugin-commonjs");
let nodeResolve = require("rollup-plugin-node-resolve");

module.exports = generateConfig;

// generates Rollup configuration
// * `extensions` is a list of additional file extensions for loading modules
//   (e.g. `[".jsx"]`)
// * `externals` determines which modules to exclude from the bundle
//   (e.g. `{ jquery: "jQuery" }` - the key represents the respective module
//   name, the value refers to the corresponding global variable)
// * `format` determines the bundle format (defaults to IIFE); cf.
//   https://github.com/rollup/rollup/wiki/JavaScript-API#format
// * `compact`, if truthy, compresses the bundle's code while retaining the
//   source code's original structure
// * `moduleName` determines the global variable to hold the entry point's
//   exports (if any)
// * `transpiler.features` determines the language features to be supported
//   within source code (e.g. `["es2015", "jsx"]`)
// * `transpiler.jsx` are JSX-specific options (e.g. `{ pragma: "createElement" }`)
// * `transpiler.exclude` is a list of modules for which to skip transpilation
//   (e.g. `["jquery"]`, perhaps due to an already optimized ES5 distribution)
function generateConfig({ extensions = [], externals, // eslint-disable-next-line indent
		format, compact, moduleName, transpiler }) {
	if(transpiler) {
		let { features } = transpiler;
		if(features && features.includes("jsx")) {
			extensions = [".jsx"].concat(extensions);
		}

		let babel = require("rollup-plugin-babel");
		let settings = generateTranspilerConfig(transpiler);
		transpiler = babel(settings);
	}

	let resolve = { jsnext: true };
	if(extensions.length) {
		resolve.extensions = [".js"].concat(extensions);
	}

	let plugins = (transpiler ? [transpiler] : []).concat([
		nodeResolve(resolve),
		commonjs({ include: "node_modules/**" })
	]);
	if(compact) {
		let cleanup = require("rollup-plugin-cleanup");
		plugins = plugins.concat(cleanup());
	}
	let cfg = { format, plugins };

	if(moduleName) {
		cfg.moduleName = moduleName;
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
			// XXX: temporary shim; cf. http://2ality.com/2016/09/global.html
			intro: 'if(typeof window !== "undefined") { var global = window; }'
		}
	});
}

function generateTranspilerConfig({ features, jsx = {}, exclude }) {
	let settings = {};
	let plugins = [];

	if(exclude) {
		settings.exclude = exclude.map(pkg => `node_modules/${pkg}/**`);
	}

	if(features.includes("es2015")) {
		settings.presets = [
			["es2015", { modules: false }]
		];
		plugins.push("external-helpers");
	}

	if(features.includes("jsx")) {
		plugins.push(["transform-react-jsx", jsx]);
	}

	if(plugins.length) {
		settings.plugins = plugins;
	}
	return settings;
}
