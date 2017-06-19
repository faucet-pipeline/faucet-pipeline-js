"use strict";

let { generateError } = require("./util");
let rollup = require("rollup");
let commonjs = require("rollup-plugin-commonjs");
let nodeResolve = require("rollup-plugin-node-resolve");
let fs = require("fs");

const DEFAULTS = {
	format: "iife"
};

let BUNDLES = {}; // configuration and state by entry point

// TODO:
// * minification support
// * `aliases` (Rollup: `paths`?)
// * source maps?
// * minification light: only stripping comments
module.exports = (callback, ...bundles) => {
	bundles.forEach(config => {
		// initialize configuration/state cache
		let { entryPoint } = config;
		config = Object.assign({}, DEFAULTS, config);
		BUNDLES[entryPoint] = {
			rollup: generateConfig(config)
		};

		generateBundle(entryPoint, callback);
	});

	return rebundler(callback);
};

function rebundler(callback) {
	return filepath => {
		Object.keys(BUNDLES).forEach(entryPoint => {
			let cache = BUNDLES[entryPoint];
			if(cache.files.includes(filepath)) {
				generateBundle(entryPoint, callback);
			}
		});
	};
}

function generateBundle(entryPoint, callback) {
	let cache = BUNDLES[entryPoint];
	let { readConfig, writeConfig } = cache.rollup;

	let options = Object.assign({}, readConfig, {
		entry: entryPoint,
		cache: cache.bundle
	});
	return rollup.rollup(options).
		catch(err => {
			if(!cache.files) { // first run
				// ensure subsequent changes are picked up
				cache.files = [fs.realpathSync(entryPoint)];
			}

			throw err;
		}).
		then(bundle => {
			cache.files = bundle.modules.reduce(collectModulePaths, []);
			cache.bundle = bundle;

			return bundle.generate(writeConfig).code;
		}).
		catch(err => {
			// also report error from within bundle, to avoid it being overlooked
			let code = generateError(err);
			return { code, error: true };
		}).
		then(code => void callback(entryPoint, code));
}

// generates Rollup configuration
// * `extensions` is a list of additional file extensions for loading modules
//   (e.g. `[".jsx"]`)
// * `externals` determines which modules to exclude from the bundle
//   (e.g. `{ jquery: "jQuery" }` - the key represents the respective module
//   name, the value refers to the corresponding global variable)
// * `format` determines the bundle format (defaults to IIFE); cf.
//   https://github.com/rollup/rollup/wiki/JavaScript-API#format
// * `moduleName` determines the global variable to hold the entry point's
//   exports (if any)
// * `transpiler.features` determines the language features to be supported
//   within source code (e.g. `["es2015", "jsx"]`)
// * `transpiler.jsx` are JSX-specific options (e.g. `{ pragma: "createElement" }`)
// * `transpiler.exclude` is a list of modules for which to skip transpilation
//   (e.g. `["jquery"]`, perhaps due to an already optimized ES5 distribution)
function generateConfig({ extensions, externals, format, moduleName, transpiler }) {
	let resolve = { jsnext: true };
	if(extensions) {
		resolve.extensions = [".js"].concat(extensions);
	}

	if(transpiler) {
		let babel = require("rollup-plugin-babel");
		let settings = generateTranspilerConfig(transpiler);
		transpiler = babel(settings);
	}

	let plugins = (transpiler ? [transpiler] : []).concat([
		nodeResolve(resolve),
		commonjs({ include: "node_modules/**" })
	]);
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
		writeConfig: {}
	});
}

function generateTranspilerConfig({ features, jsx = {}, exclude }) {
	let settings = exclude ? { exclude } : {};

	if(features.includes("es2015")) {
		settings.presets = ["es2015-rollup"];
	}

	if(features.includes("jsx")) {
		settings.plugins = ["transform-react-jsx", jsx];
	}

	return settings;
}

// adapted from Rollup
function collectModulePaths(memo, module) {
	let filepath = module.id;

	// skip plugin helper modules
	if(/\0/.test(filepath)) {
		return memo;
	}

	// resolve symlinks to avoid duplicate watchers
	try {
		filepath = fs.realpathSync(filepath);
	} catch(err) {
		return memo;
	}

	return memo.concat(filepath);
}
