"use strict";

let Bundle = require("./bundle");

module.exports = (config, assetManager, { watcher, browsers, compact } = {}) => {
	let bundles = config.map(bundleConfig => {
		// NB: bundle-specific configuration can override global options
		bundleConfig = Object.assign({ compact }, bundleConfig);
		return makeBundle(bundleConfig, assetManager.resolvePath, { browsers });
	});

	let res = bundles.map(bundle => {
		return bundle.compile().
			then(makeWriter(bundle, assetManager));
	});
	res = Promise.all(res); // TODO: optionally return invididual promises?
	if(!watcher) {
		return res;
	}

	watcher.on("edit", filepaths => {
		bundles.forEach(bundle => {
			let res = bundle.recompile(...filepaths);
			res && res. // guards against irrelevant changes
				then(makeWriter(bundle, assetManager));
		});
	});
	return res; // XXX: akward? only reports the initial compilation's status
};

function makeWriter(bundle, assetManager) {
	return ({ code, error }) => {
		assetManager.writeFile(bundle.target, code, error);
	};
}

function makeBundle(config, resolvePath, { browsers }) {
	// dissect configuration for constructor
	config = Object.assign({}, config);
	let [entryPoint, target] = extract(config, "source", "target");

	entryPoint = resolvePath(entryPoint);
	target = resolvePath(target, { enforceRelative: true });
	return new Bundle(entryPoint, target, config, { browsers });
}

// removes properties from object, returning their respective values
function extract(obj, ...props) {
	return props.map(prop => {
		let value = obj[prop];
		delete obj[prop];
		return value;
	});
}
