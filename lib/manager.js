"use strict";

let path = require("path");

module.exports = class AssetManager {
	constructor(referenceDir) {
		this._referenceDir = referenceDir;

		// bind methods for convenience -- TODO: DRY
		this.writeFile = this.writeFile.bind(this);
		this.reportError = this.reportError.bind(this);
		this.resolvePath = this.resolvePath.bind(this);
	}

	writeFile(filepath, content, err) {
		// FIXME: TODO
	}

	reportError(msg) {
		// FIXME: TODO
	}

	resolvePath(filepath, { nodeResolution } = {}) {
		if(filepath.substr(0, 2) === "./") {
			return path.resolve(this._referenceDir, filepath);
		} else if(!nodeResolution) {
			throw new Error(`path must be relative: \`${repr(filepath)}\``);
		} else { // attempt via Node resolution algorithm
			try {
				return resolveModulePath(filepath, this._referenceDir);
			} catch(err) {
				throw new Error(`could not resolve \`${repr(filepath)}\``);
			}
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

function repr(value) {
	return `\`${JSON.stringify(value)}\``;
}
