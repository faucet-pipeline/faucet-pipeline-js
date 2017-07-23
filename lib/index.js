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
		let res = writeBundle(referenceDir, // eslint-disable-next-line indent
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

function writeBundle(referenceDir, // eslint-disable-next-line indent
		bundlePath, code, manifest, { fingerprint }) {
	// handle potential compilation errors
	let { error } = code;
	if(error) {
		code = code.code;
	}

	let filepath = fingerprint ? generateFingerprint(bundlePath, code) : bundlePath;
	return writeFile(filepath, code).
		then(_ => {
			if(manifest !== false) {
				let bundle = path.relative(referenceDir, bundlePath);
				let actualPath = path.relative(referenceDir, filepath);
				generateManifest(bundle, actualPath, manifest);
			}

			let symbol = error ? "✗" : "✓";
			console.log(`${symbol} ${filepath}`); // eslint-disable-line no-console
		}, err => {
			code = generateError(err);
			writeFile(filepath, code);
			throw err;
		});
}

function generateManifest(bundlePath, actualPath, { file, baseURI = "" }) {
	/* eslint-disable indent */
	MANIFEST[bundlePath] = baseURI.call ?
			baseURI(actualPath, path.basename(actualPath)) :
			[baseURI.replace(/\/$/, ""), actualPath].join("/");
	/* eslint-enable indent */

	let filepath = path.resolve(file);
	writeFile(filepath, JSON.stringify(MANIFEST) + "\n").
		catch(err => { // eslint-disable-line handle-callback-err
			console.error(`✗ ERROR: failed to create \`${filepath}\``);
		});
}

function writeFile(filepath, contents) {
	return new Promise((resolve, reject) => {
		fs.writeFile(filepath, contents, err => {
			if(err) {
				reject(err);
			} else {
				resolve();
			}
		});
	});
}
