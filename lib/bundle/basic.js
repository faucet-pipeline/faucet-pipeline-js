"use strict";

let generateBundle = require("./bundler");
let generateConfig = require("./config");
let { generateError } = require("../util");

let DEFAULTS = {
	format: "iife"
};

module.exports = class BasicBundle {
	constructor(config, { browsers, plugins }) {
		config = Object.assign({}, DEFAULTS, config);
		this._config = generateConfig(config, { browsers });
	}

	compile(entryPoint) {
		return generateBundle(entryPoint, this._config, this._cache).
			then(({ code, modules, cache }) => {
				this._modules = modules; // XXX: only required for non-basic bundles
				this._cache = cache;
				return { code };
			}, err => ({
				// also report error from within bundle, to avoid it being overlooked
				code: generateError(err),
				error: err
			}));
	}
};
