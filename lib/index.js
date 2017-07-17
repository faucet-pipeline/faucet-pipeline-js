"use strict";

let Bundler = require("./bundler");
let { generateError } = require("./util");
let { generateFingerprint } = require("faucet-pipeline-util");
let mkdirp = require("mkdirp");
let fs = require("fs");
let path = require("path");

let MANIFEST = {}; // maps bundles' entry point to corresponding URI

module.exports = (config, { rootDir, configDir }, { watcher, fingerprint, compact }) => {
	let targetDir = path.resolve(configDir, config.targetDir);
	mkdirp(targetDir, err => {
		if(err) {
			console.error(err);
			return;
		}

		start(config.bundles, configDir, // eslint-disable-next-line indent
				targetDir, config.manifest, { watcher, fingerprint, compact });
	});
};

function start(bundleConfigs, referenceDir, // eslint-disable-next-line indent
		targetDir, manifest, { watcher, fingerprint, compact }) {
	let onBundle = (entryPoint, config, code, error) => {
		let terminate = error && !watcher && (_ => process.exit(1));

		let target = path.resolve(targetDir, config.target);
		let res = writeBundle(entryPoint, // eslint-disable-next-line indent
				target, code, manifest, { fingerprint }).
			catch(err => {
				console.error(`ERROR: ${err}`);
				terminate();
			});
		if(terminate) {
			res.then(terminate);
		}
	};

	let bundler = new Bundler(bundleConfigs, referenceDir, { compact }, onBundle);
	if(watcher) {
		watcher.on("edit", bundler.rebuild.bind(bundler));
	}
}

function writeBundle(entryPoint, filepath, code, manifest, { fingerprint }) {
	// handle potential compilation errors
	let { error } = code;
	if(error) {
		code = code.code;
	}

	if(fingerprint) {
		filepath = generateFingerprint(filepath, code);
	}

	let res = new SimplePromise();
	fs.writeFile(filepath, code, err => {
		if(err) {
			code = generateError(err);
			// eslint-disable-next-line handle-callback-err
			fs.writeFile(filepath, code, err => {});
			res.reject(err);
			return;
		}

		if(manifest !== false) {
			generateManifest(entryPoint, filepath, manifest);
		}

		let symbol = error ? "✗" : "✓";
		console.log(`${symbol} ${filepath}`); // eslint-disable-line no-console
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
