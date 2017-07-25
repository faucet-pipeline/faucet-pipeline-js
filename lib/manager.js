"use strict";

let { generateFingerprint } = require("faucet-pipeline-util");
let mkdirp = require("mkdirp");
let fs = require("fs");
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

function createFile(filepath, contents) {
	return new Promise((resolve, reject) => {
		mkdirp(path.dirname(filepath), err => { // XXX: inefficient; only necessary once
			if(err) {
				reject(err);
				return;
			}

			fs.writeFile(filepath, contents, err => {
				err ? reject(err) : resolve();
			});
		});
	});
}

// TODO: move into faucet-pipeline-util?
// XXX: use `path.join` instead? (uses platform-specific separator though)
function uriJoin(...segments) {
	let last = segments.pop();
	segments.map(segment => segment.replace(/\/$/, "")); // strip trailing slash
	return segments.concat(last).join("/");
}

function abort() {
	process.exit(1);
}

function noop() {}
