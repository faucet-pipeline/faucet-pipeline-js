"use strict";

let bundler = require("./bundler");
let watcher = require("./watcher");

module.exports = (bundles, options) => {
	let rebundle = bundler(onBundle, ...bundles);

	if(options.watch) {
		watcher(options.rootDir, rebundle);
	}
};

function onBundle(entryPoint, code) {
	console.log("~~~", entryPoint, code);
}
