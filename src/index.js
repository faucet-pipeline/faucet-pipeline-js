"use strict";

let bundler = require("./bundler");
let watcher = require("./watcher");
let { generateError, generateHash, debounce } = require("./util");
let mkdirp = require("mkdirp");
let fs = require("fs");
let path = require("path");

let MANIFEST = {}; // maps bundles' entry point to corresponding URI

module.exports = (bundles, targetDir, manifest, options) => {
	targetDir = path.resolve(options.rootDir, targetDir);
	mkdirp(targetDir, err => {
		if(err) {
			console.error(err);
			return;
		}

		start(bundles, targetDir, manifest, options);
	});
};

function start(bundles, targetDir, manifest, { rootDir, watch, suppressFingerprinting }) {
	let onBundle = (entryPoint, code) => {
		writeBundle(entryPoint, targetDir, code, manifest, { suppressFingerprinting });
	};
	let rebundle = bundler(onBundle, ...bundles);

	if(watch) {
		watcher(rootDir, watch === "poll").
			// NB: debouncing avoids redundant invocations
			on("edit", debounce(100, rebundle)); // XXX: magic number
	}
}

function writeBundle(entryPoint, targetDir, code, manifest, { suppressFingerprinting }) {
	// handle potential compilation errors
	let { error } = code;
	if(error) {
		code = code.code;
	}

	let ext = "." + entryPoint.split(".").pop(); // XXX: brittle; assumes regular file extension
	let name = path.basename(entryPoint, ext);
	if(!suppressFingerprinting) {
		let hash = generateHash(code);
		name = `${name}-${hash}`;
	}
	let filename = `${name}${ext}`;

	let filepath = path.resolve(targetDir, filename);
	fs.writeFile(filepath, code, err => {
		if(err) {
			code = generateError(err);
			// eslint-disable-next-line handle-callback-err
			fs.writeFile(filepath, code, err => {});
			return;
		}

		generateManifest(entryPoint, filename, manifest); // TODO: optional

		let symbol = error ? "✗" : "✓";
		console.log(`${symbol} ${filename}`); // eslint-disable-line no-console
	});
}

function generateManifest(entryPoint, bundle, { file, baseURI = "" }) {
	MANIFEST[entryPoint] = `${baseURI.replace(/\/$/, "")}/${bundle}`;

	let filepath = path.resolve(file);
	fs.writeFile(filepath, JSON.stringify(MANIFEST), err => {
		if(err) {
			console.error(`✗ ERROR: failed to create \`${filepath}\``);
		}
	});
}
