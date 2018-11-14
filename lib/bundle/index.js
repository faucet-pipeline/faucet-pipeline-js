"use strict";

let BasicBundle = require("./basic");

module.exports = class Bundle extends BasicBundle {
	constructor(entryPoint, target, config, { browsers }) {
		// extract bundle-specific fingerprinting, if any
		config = Object.assign({}, config);
		if(config.fingerprint !== undefined) {
			var fingerprint = config.fingerprint; // eslint-disable-line no-var
			delete config.fingerprint;
		}
		super(config, { browsers });

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

		return super.compile(this.entryPoint);
	}
};
