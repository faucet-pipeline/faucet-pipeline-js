"use strict";

let { createFile, generateFingerprint, uriJoin } = require("faucet-pipeline-util");
let path = require("path");

module.exports = class AssetManager {
	constructor(referenceDir, manifestPath, baseURI, { fingerprint, watchMode }) {
		this.referenceDir = referenceDir;
		this.manifestPath = manifestPath;
		this.baseURI = baseURI;
		this.fingerprint = fingerprint;
		this.watchMode = watchMode;
		this._index = {};
	}

	writeBundle(code, bundlePath, error) {
		let terminate = (error && !this.watchMode) ? abort : noop;

		let filepath = bundlePath;
		if(this.fingerprint) {
			filepath = generateFingerprint(filepath, code);
		}
		return createFile(filepath, code).
			then(_ => {
				let symbol = error ? "✗" : "✓";
				console.log(`${symbol} ${bundlePath}`); // eslint-disable-line no-console
			}).
			then(_ => {
				return this.manifestPath === false ? null : this.
					updateManifest(bundlePath, filepath);
			}).
			then(terminate).
			catch(err => {
				console.error("ERROR:", err);
				terminate();
			});
	}

	updateManifest(bundlePath, actualPath) {
		[bundlePath, actualPath] = [bundlePath, actualPath].map(filepath => {
			return path.relative(this.referenceDir, filepath);
		});

		let { baseURI } = this;
		this._index[bundlePath] = baseURI.call ?
			baseURI(actualPath, path.basename(actualPath)) :
			uriJoin(baseURI, actualPath);
		return createFile(this.manifestPath, JSON.stringify(this._index) + "\n");
	}
};

function abort() {
	process.exit(1);
}

function noop() {}
