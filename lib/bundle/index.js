"use strict";

let generateBundle = require("./bundler");
let generateConfig = require("./config");
let { generateError } = require("../util");

let DEFAULTS = {
	format: "iife"
};

module.exports = class Bundle {
	constructor(entryPoint, target, config, { browsers }) {
		this.entryPoint = entryPoint;
		this.target = target;

		config = Object.assign({}, DEFAULTS, config);
		if(config.fingerprint !== undefined) {
			this.fingerprint = config.fingerprint;
			delete config.fingerprint;
		}
		this._config = generateConfig(config, { browsers });
	}

	// compiles the bundle - if a list of file paths is provided, compilation
	// will be aborted unless the dependency graph includes any of those files
	compile(filepaths) {
		if(!filepaths) { // initial compilation
			this._modules = new Set([this.entryPoint]); // XXX: awkward?
		}

		if(filepaths && !this._modules.has(...filepaths)) {
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
