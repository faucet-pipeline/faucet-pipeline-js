"use strict";

let bundler = require("./bundler");
let watcher = require("./watcher");

module.exports = (bundles, options) => {
	let rebundle = bundler(...bundles);

	if(options.watch) {
		watcher(options.rootDir, rebundle);
	}
};
