"use strict";

let bundler = require("./bundler");
let watcher = require("./watcher");
let { generateError, generateHash, debounce } = require("./util");
let mkdirp = require("mkdirp");
let fs = require("fs");
let path = require("path");

module.exports = (bundles, targetDir, options) => {
	targetDir = path.resolve(options.rootDir, targetDir);
	mkdirp(targetDir, err => {
		if(err) {
			console.error(err);
			return;
		}

		start(bundles, targetDir, options);
	});
};

function start(bundles, targetDir, options) {
	let onBundle = (entryPoint, code) => {
		let { suppressFingerprinting } = options;
		writeBundle(entryPoint, targetDir, code, { suppressFingerprinting });
	};
	let rebundle = bundler(onBundle, ...bundles);

	if(options.watch) {
		watcher(options.rootDir, options.watch === "poll").
			// NB: debouncing avoids redundant invocations
			on("edit", debounce(100, rebundle)); // XXX: magic number
	}
}

function writeBundle(entryPoint, targetDir, code, options) {
	// handle potential compilation errors
	let { error } = code;
	if(error) {
		code = code.code;
	}

	let ext = "." + entryPoint.split(".").pop(); // XXX: brittle; assumes regular file extension
	let name = path.basename(entryPoint, ext);
	if(!options.suppressFingerprinting) {
		let hash = generateHash(code);
		name = `${name}-${hash}`;
	}
	let filename = `${name}${ext}`;

	let filepath = path.resolve(targetDir, filename);
	fs.writeFile(filepath, code, err => {
		if(!err) {
			let symbol = error ? "✗" : "✓";
			console.log(`${symbol} ${filename}`); // eslint-disable-line no-console
			return;
		}

		code = generateError(err);
		// eslint-disable-next-line handle-callback-err
		fs.writeFile(filepath, code, err => {});
	});
}
