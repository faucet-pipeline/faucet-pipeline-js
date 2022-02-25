"use strict";

let generateBundle = require("./bundler");
let generateConfig = require("./config");
let { generateError } = require("../util");

module.exports = class Bundle {
	constructor(entryPoint, target, config, { browsers }) {
		// extract bundle-specific fingerprinting, if any
		config = Object.assign({}, config);
		if(config.fingerprint !== undefined) {
			var fingerprint = config.fingerprint; // eslint-disable-line no-var
			delete config.fingerprint;
		}
		this._config = generateConfig(config, { browsers });

		this.entryPoint = entryPoint;
		this.target = target;
		if(fingerprint !== undefined) {
			this.fingerprint = fingerprint;
		}
	}

	// compiles the bundle - if a list of file paths is provided, compilation
	// will be aborted unless the dependency graph includes any of those files
	compile(filepaths) {
		if(!filepaths) { // initial compilation
			this._modules = new Set([this.entryPoint]); // XXX: awkward?
		}

		let modules = this._modules;
		if(filepaths && !filepaths.some(fp => modules.has(fp))) {
			return false;
		}

		return generateBundle(this.entryPoint, this._config, this._cache).
			then(({ code, modules, cache }) => {
				this._modules = modules;
				this._cache = cache;
				return { code };
			}, err => ({
				// also report error from within bundle, to avoid it being overlooked
				code: generateError(err),
				error: err
			}));
	}
};
