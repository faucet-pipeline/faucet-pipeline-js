"use strict";

let bundler = require("./bundler");
let watcher = require("./watcher");
let { generateError, generateHash, debounce } = require("./util");
let mkdirp = require("mkdirp");
let fs = require("fs");
let path = require("path");

let MANIFEST = {}; // maps bundles' entry point to corresponding URI

module.exports = (rootDir, { config = "faucet.js", // eslint-disable-next-line indent
		watch, suppressFingerprinting, compact }) => {
	config = require(path.resolve(rootDir, config)).js;

	let targetDir = path.resolve(rootDir, config.targetDir);
	mkdirp(targetDir, err => {
		if(err) {
			console.error(err);
			return;
		}

		start(config.bundles, targetDir, // eslint-disable-next-line indent
				config.manifest, { rootDir, watch, suppressFingerprinting, compact });
	});
};

function start(bundles, targetDir, manifest, // eslint-disable-next-line indent
		{ rootDir, watch, suppressFingerprinting, compact }) {
	let onBundle = (entryPoint, code) => {
		let res = writeBundle(entryPoint, // eslint-disable-next-line indent
				targetDir, code, manifest, { suppressFingerprinting });
		if(!watch && code.error) {
			res.catch(err => {
				console.error(`ERROR: ${err}`);
			}).then(_ => {
				process.exit(1);
			});
		}
	};
	let rebundle = bundler(onBundle, { compact }, ...bundles);

	if(watch) {
		watcher(rootDir).
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

	let res = new SimplePromise();
	let filepath = path.resolve(targetDir, filename);
	fs.writeFile(filepath, code, err => {
		if(err) {
			code = generateError(err);
			// eslint-disable-next-line handle-callback-err
			fs.writeFile(filepath, code, err => {});
			res.reject(err);
			return;
		}

		generateManifest(entryPoint, filename, manifest); // TODO: optional

		let symbol = error ? "✗" : "✓";
		console.log(`${symbol} ${filename}`); // eslint-disable-line no-console
		res.resolve();
	});
	return res;
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

function SimplePromise() {
	let prom = new Promise((resolve, reject) => {
		// expose resolving functions
		this.resolve = resolve;
		this.reject = reject;
	});

	this.then = prom.then.bind(prom);
	this.catch = prom.catch.bind(prom);
}
