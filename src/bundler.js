"use strict";

let { generateError, filterObject } = require("./util");
let rollup = require("rollup");
let fs = require("fs");

const DEFAULTS = {
	format: "umd"
};

let BUNDLES = {}; // configuration and state by entry point

// TODO: (cf. complate-jsx)
// * minification support
// * `includePaths`
// * `extensions`
// * `aliases`
// * `externals`
// * `noTranspile`
// * `moduleName`
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
			return bundle.generate(cfg).code;
		}).
		catch(err => {
			// also report error from within bundle, to avoid it being overlooked
			let code = generateError(err);
			return { code, error: true };
		}).
		then(code => void callback(entryPoint, code));
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
