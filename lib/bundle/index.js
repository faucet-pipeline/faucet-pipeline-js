"use strict";

let generateConfig = require("./config");
let { generateError } = require("../util");
let rollup = require("rollup");
let path = require("path");

const DEFAULTS = {
	format: "iife"
};

module.exports = class Bundle {
	constructor(entryPoint, target, config) {
		this.entryPoint = entryPoint;
		this.target = target;

		config = Object.assign({}, DEFAULTS, config);
		this._config = generateConfig(config);

		this._modules = new Set([this.entryPoint]);
	}

	// recompiles the bundle if its dependency graph includes any of the given files
	recompile(...filepaths) {
		let abort = !this._cache || // initial compilation still in progress
				!filepaths.some(fp => this._modules.has(fp)); // not relevant
		return abort ? null : this.compile();
	}

	compile() {
		let { readConfig, writeConfig } = this._config;
		let options = Object.assign({}, readConfig, {
			input: this.entryPoint,
			cache: this._cache
		});
		return rollup.rollup(options).
			then(_bundle => {
				this._cache = _bundle;
				this._modules = _bundle.modules.reduce(collectModulePaths, new Set());
				return _bundle.generate(writeConfig);
			}).
			then(_bundle => ({
				code: _bundle.code
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
