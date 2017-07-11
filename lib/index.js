"use strict";

let bundler = require("./bundler");
let { generateError, generateHash } = require("./util");
let mkdirp = require("mkdirp");
let fs = require("fs");
let path = require("path");

let MANIFEST = {}; // maps bundles' entry point to corresponding URI

module.exports = (config, { rootDir, configDir }, // eslint-disable-next-line indent
		{ watcher, suppressFingerprinting, compact }) => {
	let targetDir = path.resolve(configDir, config.targetDir);
	mkdirp(targetDir, err => {
		if(err) {
			console.error(err);
			return;
		}

		start(config.bundles, targetDir, // eslint-disable-next-line indent
				config.manifest, { watcher, suppressFingerprinting, compact });
	});
};

function start(bundles, targetDir, manifest, // eslint-disable-next-line indent
		{ watcher, suppressFingerprinting, compact }) {
	let onBundle = (entryPoint, code) => {
		let res = writeBundle(entryPoint, // eslint-disable-next-line indent
				targetDir, code, manifest, { suppressFingerprinting });
		if(!watcher && code.error) {
			res.catch(err => {
				console.error(`ERROR: ${err}`);
			}).then(_ => {
				process.exit(1);
			});
		}
	};
	let rebundle = bundler(onBundle, { compact }, ...bundles);

	if(watcher) {
		watcher.on("edit", rebundle);
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

		if(manifest !== false) {
			generateManifest(entryPoint, filename, manifest);
		}

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
