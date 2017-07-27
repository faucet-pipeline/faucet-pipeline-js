"use strict";

let generateConfig = require("./config");
let { generateError } = require("../util");
let rollup = require("rollup");
let path = require("path");

const DEFAULTS = {
	format: "iife"
};

module.exports = class Bundle {
	constructor(config, referenceDir) {
		this.entryPoint = path.resolve(referenceDir, config.entryPoint);
		this.target = path.resolve(referenceDir, config.target);

		config = Object.assign({}, DEFAULTS, config);
		this._config = generateConfig(config);

		this._modules = new Set([this.entryPoint]);
	}

	// recompiles the bundle if its dependency graph includes any of the given files
	rebuild(manager, ...filepaths) {
		let abort = !this._cache || // initial compilation still in progress
				!filepaths.some(fp => this._modules.has(fp)); // not relevant
		return abort ? Promise.resolve() : this.generate(manager);
	}

	generate(manager) {
		return this.compile().
			then(({ code, error }) => {
				return manager.writeBundle(code, this.target, error).
					then(bundlePath => ({ bundlePath, error }));
			});
	}

	compile() {
		let { readConfig, writeConfig } = this._config;
		let options = Object.assign({}, readConfig, {
			entry: this.entryPoint,
			cache: this._cache
		});
		return rollup.rollup(options).
			then(bundle => {
				this._cache = bundle;
				this._modules = bundle.modules.reduce(collectModulePaths, new Set());
				return bundle.generate(writeConfig);
			}).
			then(bundle => ({
				code: bundle.code
			}), err => ({
				// also report error from within bundle, to avoid it being overlooked
				code: generateError(err),
				error: err
			}));
	}
};

// adapted from Rollup
function collectModulePaths(memo, module) {
	let filepath = module.id;

	// skip plugin helper modules
	if(/\0/.test(filepath)) {
		return memo;
	}

	return memo.add(filepath);
}
