"use strict";

let bundler = require("./bundler");
let watcher = require("./watcher");
let { generateError, generateHash } = require("./util");
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
		writeBundle(entryPoint, targetDir, code);
		// TODO: remove previous bundle(s)
	};
	let rebundle = bundler(onBundle, ...bundles);

	if(options.watch) {
		watcher(options.rootDir, options.watch === "poll").
			on("edit", rebundle);
	}
}

function writeBundle(entryPoint, targetDir, code) {
	let ext = "." + entryPoint.split(".").pop(); // XXX: brittle; assumes regular file extension
	let name = path.basename(entryPoint, ext);
	let hash = generateHash(code);
	let filename = `${name}-${hash}${ext}`;

	let filepath = path.resolve(targetDir, filename);
	fs.writeFile(filepath, code, err => {
		if(!err) {
			console.log(`✓ ${filename}`); // eslint-disable-line no-console
			return;
		}

		code = generateError(err);
		// eslint-disable-next-line handle-callback-err
		fs.writeFile(filepath, code, err => {});
	});
}
