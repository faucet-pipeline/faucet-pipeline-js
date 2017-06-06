"use strict";

let rollup = require("rollup");
let fs = require("fs");

let INDEX = {}; // files by bundles' target file path -- TODO: rename
let CACHES = {}; // bundles by target file path

module.exports = (...bundles) => {
	bundles.forEach(({ entryPoint, target, format }) => {
		generateBundle(entryPoint, target, format || "umd");
	});

	return onChange;
};

function onChange(filepath) {
	filepath = fs.realpathSync(filepath);

	Object.keys(INDEX).forEach(target => {
		let { entryPoint, format, files } = INDEX[target];
		if(files.includes(filepath)) {
			generateBundle(entryPoint, target, format);
		}
	});
}

function generateBundle(entryPoint, target, format) {
	return rollup.rollup({ entry: entryPoint, cache: CACHES[target] }).
		then(bundle => {
			bundle.write({ format, dest: target });

			// normalize file paths -- XXX: unnecessary?
			// NB: cannot do this beforehand because otherwise the bundle does
			//     not exist yet
			[entryPoint, target] = [entryPoint, target].
				map(filepath => fs.realpathSync(filepath));

			let files = bundle.modules.reduce(collectModulePaths, []);
			CACHES[target] = bundle;
			INDEX[target] = { entryPoint, format, files };
		});
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
