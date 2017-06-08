"use strict";

let { generateError } = require("./util");
let rollup = require("rollup");
let fs = require("fs");

let INDEX = {}; // bundle state by entry point
let CACHES = {}; // bundles by entry point

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
	bundles.forEach(({ entryPoint, format }) => {
		generateBundle(entryPoint, format, callback);
	});

	return rebundler(callback);
};

function rebundler(callback) {
	return filepath => {
		Object.keys(INDEX).forEach(entryPoint => {
			let { format, files } = INDEX[entryPoint];
			if(files.includes(filepath)) {
				generateBundle(entryPoint, format, callback);
			}
		});
	};
}

function generateBundle(entryPoint, format = "iife", callback) {
	return rollup.rollup({ entry: entryPoint, cache: CACHES[entryPoint] }).
		catch(err => {
			if(!INDEX[entryPoint]) { // first run
				// ensure subsequent changes are picked up
				INDEX[entryPoint] = { // XXX: DRY; cf. below
					format,
					files: [fs.realpathSync(entryPoint)]
				};
			}

			throw err;
		}).
		then(bundle => {
			CACHES[entryPoint] = bundle;
			INDEX[entryPoint] = {
				format,
				files: bundle.modules.reduce(collectModulePaths, [])
			};

			return bundle.generate({ format }).code;
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
