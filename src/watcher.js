"use strict";

let chokidar = require("chokidar");
let fs = require("fs");

module.exports = (rootDir, callback) => {
	let watcher = chokidar.watch(rootDir, { persistent: true });

	let handler = filepath => {
		filepath = fs.realpathSync(filepath);
		callback(filepath);
	};

	watcher.on("ready", _ => {
		watcher.on("add", handler).
			on("change", handler).
			on("unlink", handler);
	});
};
