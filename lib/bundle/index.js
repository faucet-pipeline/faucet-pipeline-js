"use strict";

let generateBundle = require("./bundler");
let generateConfig = require("./config");
let { generateError } = require("../util");
let SerializedRunner = require("faucet-pipeline/lib/util/runner");

let DEFAULTS = {
	format: "iife"
};

module.exports = class Bundle {
	constructor(entryPoint, target, config, { browsers, resolvePath }) {
		this.entryPoint = entryPoint;
		this.target = target;

		config = Object.assign({}, DEFAULTS, config);
		this._config = generateConfig(config, { browsers, resolvePath });
	}

	// recompiles the bundle if its dependency graph includes any of the given files
	recompile(...filepaths) {
		let modules = this._modules || new Set([this.entryPoint]); // XXX: awkward?
		let relevant = filepaths.some(filepath => modules.has(filepath));
		return relevant && this.compile();
	}

	compile() {
		if(this._runner) { // recompile
			return this._runner.rerun();
		}

		this._runner = new SerializedRunner(_ => this._compile());
		return this._runner.run();
	}

	_compile() {
		return generateBundle(this.entryPoint, this.target, this._config, this._cache).
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
