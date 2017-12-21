"use strict";

let Bundle = require("./bundle");

module.exports = (config, assetManager, { watcher } = {}) => {
	let bundles = config.map(bundleConfig => {
		return makeBundle(bundleConfig, assetManager.resolvePath);
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

function makeBundle(config, resolvePath) {
	// dissect configuration for constructor
	config = Object.assign({}, config);
	let [entryPoint, target] = extract(config, "entryPoint", "target");

	entryPoint = resolvePath(entryPoint, { nodeResolution: true });
	target = resolvePath(target); // NB: skipping Node resolution algorithm here
	return new Bundle(entryPoint, target, config);
}

// removes properties from object, returning their respective values
function extract(obj, ...props) {
	return props.map(prop => {
		let value = obj[prop];
		delete obj[prop];
		return value;
	});
}
