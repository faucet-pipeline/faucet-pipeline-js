"use strict";

let chokidar = require("chokidar");
let EventEmitter = require("events");
let path = require("path");

module.exports = rootDir => {
	let watcher = chokidar.watch(`${rootDir}/**`, {});
	let emitter = new EventEmitter();

	// NB: potentially invoked multiple times for a single change
	let notify = filepath => {
		filepath = path.resolve(rootDir, filepath);
		emitter.emit("edit", filepath);
	};

	watcher.on("ready", _ => {
		watcher.on("add", notify).
			on("change", notify).
			on("unlink", notify);
	});
	return emitter;
};
