"use strict";

let path = require("path");

class AssetManager { // FIXME: does not belong here
	constructor(referenceDir) {
		this._referenceDir = referenceDir;

		// bind methods for convenience -- TODO: DRY
		this.writeFile = this.writeFile.bind(this);
		this.reportError = this.reportError.bind(this);
		this.relativePath = this.relativePath.bind(this);
	}

	writeFile(filepath, content) {
		// FIXME: TODO
	}

	reportError(msg) {
		// FIXME: TODO
	}

	relativePath(filepath) {
		if(filepath.substr(0, 2) !== "./") {
			throw new Error(`path must be relative: \`${repr(filepath)}\``);
		}
		return path.resolve(this._referenceDir, filepath);
	}
}

exports.DummyAssetManager = class DummyAssetManager extends AssetManager {
	constructor(...args) {
		super(...args);
		this.writes = [];
	}

	writeFile(filepath, content) {
		this.writes.push({ filepath, content });
		return new Promise(resolve => {
			setTimeout(_ => resolve(), 1);
		});
	}
}

function repr(value) {
	return `\`${JSON.stringify(value)}\``;
}
