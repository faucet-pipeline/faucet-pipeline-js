"use strict";

let { bindMethodContext } = require("./util");
let { createFile, generateFingerprint, uriJoin } = require("faucet-pipeline-util");
let path = require("path");

module.exports = class AssetManager {
	constructor(referenceDir, { manifest, fingerprint, exitOnError } = {}) {
		this.referenceDir = referenceDir;
		this.manifest = manifest;
		this.fingerprint = fingerprint;
		this.exitOnError = exitOnError;
		this._index = {};

		// bind methods for convenience
		bindMethodContext(this, "writeFile", "resolvePath");
	}

	writeFile(filepath, data, error) {
		let originalPath = filepath;
		if(this.fingerprint) {
			filepath = generateFingerprint(filepath, data);
		}

		return createFile(filepath, data).
			then(_ => this._updateManifest(originalPath, filepath)).
			then(_ => {
				this._report(originalPath, error);
				if(error && this.exitOnError) {
					abort();
				}
			}).
			catch(abort);
	}

	resolvePath(filepath, { nodeResolution } = {}) {
		if(filepath.substr(0, 2) === "./") {
			return path.resolve(this.referenceDir, filepath);
		} else if(!nodeResolution) {
			throw new Error(`path must be relative: \`${repr(filepath)}\``);
		} else { // attempt via Node resolution algorithm
			try {
				return resolveModulePath(filepath, this.referenceDir);
			} catch(err) {
				throw new Error(`could not resolve \`${repr(filepath)}\``);
			}
		}
	}

	_updateManifest(originalPath, actualPath) {
		[originalPath, actualPath] = [originalPath, actualPath].map(filepath => {
			return path.relative(this.referenceDir, filepath);
		});

		let { file: filepath, baseURI } = this.manifest;
		/* eslint-disable indent */
		this._index[originalPath] = baseURI.call ?
				baseURI(actualPath, path.basename(actualPath)) :
				uriJoin(baseURI, actualPath);
		/* eslint-enable indent */
		return createFile(filepath, JSON.stringify(this._index) + "\n");
	}

	_report(filepath, error) {
		let relPath = path.relative(this.referenceDir, filepath);
		if(error) {
			console.error(`✗ ${relPath}: ${error.message || error}`);
		} else {
			console.error(`✓ ${relPath}`);
		}
	}
};

function resolveModulePath(filepath, rootDir) {
	// older versions of Node do not support `require.resolve`'s `paths` option
	let legacy = !require.resolve.paths;
	if(legacy) {
		legacy = process.env.NODE_PATH; // cache previous value
		rootDir = rootDir.replace(/\/{1,}$/, ""); // strip trailing slashes, to be safe
		process.env.NODE_PATH = rootDir + "/node_modules";
		require("module").Module._initPaths();
	}

	let res = require.resolve(filepath, { paths: [rootDir] });

	if(legacy) { // restore previous environment
		process.env.NODE_PATH = legacy;
		require("module").Module._initPaths();
	}

	return res;
}

function abort() {
	console.error("aborting");
	process.exit(1);
}

function repr(value) {
	return `\`${JSON.stringify(value)}\``;
}
