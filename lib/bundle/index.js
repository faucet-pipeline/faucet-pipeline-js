"use strict";

let generateBundle = require("./bundler");
let generateConfig = require("./config");
let { generateError } = require("../util");
let SerializedRunner = require("faucet-pipeline/lib/util/runner");
let { repr } = require("faucet-pipeline/lib/util");
let path = require("path");

let DEFAULTS = {
	config: {
		format: "iife"
	},
	reporting: {
		threshold: 100000 * 1024 // ~100 kB
	}
};

module.exports = class Bundle {
	constructor(entryPoint, target, config, { browsers, referenceDir, resolvePath }) {
		this.entryPoint = entryPoint;
		this.target = target;

		config = Object.assign({}, DEFAULTS.config, config);
		if(config.fingerprint !== undefined) {
			this.fingerprint = config.fingerprint;
			delete config.fingerprint;
		}
		this._config = generateConfig(config, { browsers, resolvePath });

		let { reporting } = config;
		if(reporting !== false) {
			let { threshold } = Object.assign({}, DEFAULTS.reporting, reporting);
			let bundle = repr(path.relative(referenceDir, target), false);
			this._config.reporting = {
				referenceDir,
				report: ({ size, originalSize, reduction }) => {
					let b2kb = i => `${Math.round(i / 1024)} kB`;
					console.error(`${bundle}: ${b2kb(originalSize)} → ` +
							`${b2kb(size)} (Δ ${Math.round(reduction)} %)`);
					if(size > threshold) {
						console.error("⚠️ this bundle looks to be fairly big - " +
								"you might want to double-check whether " +
								"that's intended and consider performance " +
								"implications for your users: " + bundle);
					}
				}
			};
		}
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
