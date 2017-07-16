"use strict";

let generateConfig = require("./config");
let { generateError } = require("../util");
let rollup = require("rollup");
let fs = require("fs");

// TODO:
// * minification support
// * `aliases` (Rollup: `paths`?)
// * source maps?
module.exports = class Bundler {
	constructor(configs, { compact }, handler) {
		this.configs = configs;
		this.handler = handler; // TODO: rename
		this.defaults = {
			format: "iife",
			compact
		};
		this._configIndex = {}; // bundle configuration by entry point
		this._bundles = {}; // configuration and state by entry point

		this.generateAll();
	}

	// selectively rebuilds bundles if the given file is relevant
	rebuild(filepath) {
		Object.keys(this._bundles).forEach(entryPoint => {
			let cache = this._bundles[entryPoint];
			if(cache.bundle === null) { // initial compilation still in progress
				return;
			}

			if(cache.files.includes(filepath)) {
				this.generate(entryPoint);
			}
		});
	}

	generateAll() {
		this.configs.forEach(config => {
			let { entryPoint } = config;

			// initialize configuration index
			// XXX: does not allow for multiple bundle configurations per entry
			//      point (e.g. with and without transpilation)
			this._configIndex[entryPoint] = config;

			// initialize configuration/state cache
			config = Object.assign({}, this.defaults, config);
			this._bundles[entryPoint] = {
				rollup: generateConfig(config),
				bundle: null, // Rollup cache
				files: [fs.realpathSync(entryPoint)]
			};

			this.generate(entryPoint);
		});
	}

	generate(entryPoint) {
		let cache = this._bundles[entryPoint];
		let { readConfig, writeConfig } = cache.rollup;

		let options = Object.assign({}, readConfig, {
			entry: entryPoint,
			cache: cache.bundle
		});
		return rollup.rollup(options).
			then(bundle => {
				cache.files = bundle.modules.reduce(collectModulePaths, []);
				cache.bundle = bundle;

				return bundle.generate(writeConfig);
			}).
			then(bundle => {
				this.notify(entryPoint, bundle.code);
			}, err => {
				// also report error from within bundle, to avoid it being overlooked
				let code = generateError(err);
				this.notify(entryPoint, code, err);
			});
	}

	notify(entryPoint, code, error) {
		let config = this._configIndex[entryPoint];
		this.handler(entryPoint, config, code, error);
	}
};

// adapted from Rollup
function collectModulePaths(memo, module) {
	let filepath = module.id;

	// skip plugin helper modules
	if(/\0/.test(filepath)) {
		return memo;
	}

	// resolve symlinks to avoid duplicate watchers
	try {
		filepath = fs.realpathSync(filepath);
	} catch(err) {
		return memo;
	}

	return memo.concat(filepath);
}
