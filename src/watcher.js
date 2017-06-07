"use strict";

let chokidar = require("chokidar");
let EventEmitter = require("events");
let fs = require("fs");
let path = require("path");

module.exports = (rootDir, poll) => {
	let watcher = chokidar.watch(rootDir, {
		persistent: true,
		usePolling: poll
	});
	let emitter = new EventEmitter();

	let notify = filepath => {
		filepath = fs.realpathSync(filepath);
		emitter.emit("edit", filepath);
	};

	watcher.on("ready", _ => {
		watcher.on("add", notify).
			on("change", notify).
			on("unlink", filepath => {
				filepath = path.resolve(rootDir, filepath);
				emitter.emit("edit", filepath);
			});
	});
	return emitter;
};
