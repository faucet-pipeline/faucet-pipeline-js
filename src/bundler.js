"use strict";

let { generateError, filterObject } = require("./util");
let rollup = require("rollup");
let babel = require("rollup-plugin-babel"); // TODO: optional
let commonjs = require("rollup-plugin-commonjs");
let nodeResolve = require("rollup-plugin-node-resolve");
let fs = require("fs");

const DEFAULTS = {
	includePaths: ["node_modules"]
	format: "iife"
};

let BUNDLES = {}; // configuration and state by entry point

// TODO:
// * minification support
// * `includePaths`
// * `aliases`
// * transpiler preset (default to ES2015)
// * source maps?
// * minification light: only stripping comments
module.exports = (callback, ...bundles) => {
	bundles.forEach(config => {
		// initialize configuration/state cache
		let { entryPoint } = config;
		BUNDLES[entryPoint] = Object.assign({}, DEFAULTS,
				filterObject(config, ["entryPoint"]));

		generateBundle(entryPoint, callback);
	});

	return rebundler(callback);
};

function rebundler(callback) {
	return filepath => {
		Object.keys(BUNDLES).forEach(entryPoint => {
			let config = BUNDLES[entryPoint];
			if(config._files.includes(filepath)) {
				generateBundle(entryPoint, callback);
			}
		});
	};
}

function generateBundle(entryPoint, callback) {
	let config = BUNDLES[entryPoint];
	return rollup.rollup({ entry: entryPoint, cache: config._cache }).
		catch(err => {
			if(!config._files) { // first run
				// ensure subsequent changes are picked up
				config._files = [fs.realpathSync(entryPoint)];
			}

			throw err;
		}).
		then(bundle => {
			config._files = bundle.modules.reduce(collectModulePaths, []);
			config._cache = bundle;

			let cfg = filterObject(config, ["_files", "_cache"]);
			cfg = generateConfig(cfg);
			return bundle.generate(cfg).code;
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
// * `includePaths`
// * `externals` determines which modules to exclude from the bundle
//   (e.g. `{ jquery: "jQuery" }` - the key represents the respective module
//   name, the value refers to the corresponding global variable)
// * `format` determines the bundle format (defaults to IIFE); cf.
//   https://github.com/rollup/rollup/wiki/JavaScript-API#format
// * `moduleName` determines the global variable to hold the entry point's
//   exports (if any)
// * `noTranspile` is a list of modules for which to skip transpilation
//   (e.g. `["jquery"]`, perhaps due to an already optimized ES5 distribution)
function generateConfig({ extensions, includePaths, externals, format,
		moduleName, noTranspile }) {
	let resolve = { jsnext: true };
	if(extensions) {
		resolve.extensions = [".js"].concat(extensions);
	}

	// ensure default include paths are always present -- XXX: breaks encapsulation
	includePaths = DEFAULTS.includePaths.concat(includePaths);
	includePaths = Array.from(new Set(includePaths));

	let cfg = {
		format,
		plugins: [
			babel(noTranspile ? { exclude: noTranspile } : {}), // TODO: optional, configuration
			nodeResolve(resolve),
			commonjs({
				include: includePaths.map(dir => `${dir.replace(/\/$/, "")}/**`)
			})
		]
	};

	if(moduleName) {
		cfg.moduleName = moduleName;
	}

	if(externals) { // excluded from bundle
		cfg.external = Object.keys(externals);
		cfg.globals = externals;
	}

	return cfg;
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
