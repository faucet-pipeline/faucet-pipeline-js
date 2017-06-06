"use strict";

let chokidar = require("chokidar");

module.exports = (rootDir, callback) => {
	let watcher = chokidar.watch(rootDir, { persistent: true });
	watcher.on("ready", _ => {
		watcher.on("add", callback).
			on("change", callback).
			on("unlink", callback);
	});
};
