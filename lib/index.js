"use strict";

let Bundle = require("./bundle");

module.exports = (config, assetManager) => {
	let bundles = config.map(bundleConfig => {
		let bundle = makeBundle(bundleConfig, assetManager.resolvePath);
		return compile(bundle, assetManager);
	});
	return Promise.all(bundles);
};

function compile(bundle, manager) {
	return bundle.compile().
		then(({ code, error }) => {
			manager.writeFile(bundle.target, code, error);
		});
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
