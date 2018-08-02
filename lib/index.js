"use strict";

let Bundle = require("./bundle");
let { abort, repr } = require("faucet-pipeline-core/lib/util");
let path = require("path");

module.exports = (config, assetManager,
		{ watcher, browsers, compact, sourcemaps } = {}) => {
	let bundles = config.map(bundleConfig => {
		// NB: bundle-specific configuration can override global options
		bundleConfig = Object.assign({ compact, sourcemap: sourcemaps }, bundleConfig);
		return makeBundle(bundleConfig, assetManager.resolvePath, { browsers });
	});

	let res = bundles.map(bundle => {
		let { fingerprint } = bundle;
		/* eslint-disable indent */
		let writer = fingerprint === undefined ?
				makeWriter(bundle, assetManager) :
				makeWriter(bundle, assetManager, { fingerprint });
		/* eslint-enable indent */
		return bundle.compile().
			then(writer);
	});
	res = Promise.all(res); // TODO: optionally return invididual promises?
	if(!watcher) {
		return res;
	}

	watcher.on("edit", filepaths => {
		bundles.forEach(bundle => {
			let res = bundle.recompile(...filepaths);
			res && // disregard irrelevant changes
				res.then(makeWriter(bundle, assetManager));
		});
	});
	return res; // XXX: akward? only reports the initial compilation's status
};

function makeWriter(bundle, assetManager, { fingerprint } = {}) {
	return ({ code, error }) => {
		if(code.length > 100000) { // ~100 kB -- XXX: arbitrary -- TODO: configurable
			console.error("⚠️ this bundle looks to be fairly big, you might " +
					"want to double-check whether that's intended and " +
					"consider performance implications for your users:\n  " +
					path.relative(assetManager.referenceDir, bundle.target));
		}

		let options = { error };
		if(fingerprint !== undefined) {
			options.fingerprint = fingerprint;
		}
		assetManager.writeFile(bundle.target, code, options);
	};
}

function makeBundle(config, resolvePath, { browsers }) {
	// dissect configuration for constructor
	config = Object.assign({}, config);
	let [entryPoint, target] = extract(config, "source", "target");
	if(!entryPoint || !target) {
		let setting = entryPoint ? "target" : "source";
		abort(`ERROR: missing ${repr(setting, false)} configuration in ` +
				"JavaScript bundle");
	}

	entryPoint = resolvePath(entryPoint);
	target = resolvePath(target, { enforceRelative: true });
	return new Bundle(entryPoint, target, config, { browsers, resolvePath });
}

// removes properties from object, returning their respective values
function extract(obj, ...props) {
	return props.map(prop => {
		let value = obj[prop];
		delete obj[prop];
		return value;
	});
}
