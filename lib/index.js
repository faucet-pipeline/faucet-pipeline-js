"use strict";

let Bundle = require("./bundle");
let { abort, repr } = require("faucet-pipeline-core/lib/util");
let path = require("path");

module.exports = (config, assetManager, { browsers, compact, sourcemaps } = {}) => {
	let bundlers = config.map(bundleConfig => makeBundler(bundleConfig,
			assetManager, { browsers, compact, sourcemaps }));

	return filepaths => Promise.all(bundlers.
		map(bundler => bundler(filepaths)));
};

function makeBundler(bundleConfig, assetManager, { browsers, compact, sourcemaps } = {}) {
	// NB: bundle-specific configuration can override global options
	if(!compact) {
		bundleConfig.compact = false;
	} else if(bundleConfig.compact === undefined) {
		bundleConfig.compact = "compact";
	}
	let config = Object.assign({ sourcemaps }, bundleConfig, { browsers });
	// dissect configuration for constructor
	let [entryPoint, target] = extract(config, "source", "target");
	if(!entryPoint || !target) {
		let setting = entryPoint ? "target" : "source";
		abort(`ERROR: missing ${repr(setting, false)} configuration in ` +
				"JavaScript bundle");
	}

	let { resolvePath } = assetManager;
	entryPoint = resolvePath(entryPoint);
	target = resolvePath(target, { enforceRelative: true });
	let bundle = new Bundle(entryPoint, target, config, { browsers });

	let writer = makeWriter(bundle, assetManager);
	return filepaths => {
		let res = bundle.compile(filepaths);
		// disregard irrelevant changes
		return res ? res.then(writer) : Promise.resolve(null);
	};
}

function makeWriter(bundle, assetManager) {
	return ({ code, error }) => {
		if(code.length > 100000) { // ~100 kB -- XXX: arbitrary -- TODO: configurable
			console.error("⚠️ this bundle looks to be fairly big, you might " +
					"want to double-check whether that's intended and " +
					"consider performance implications for your users:\n  " +
					path.relative(assetManager.referenceDir, bundle.target));
		}

		let options = { error };
		if(bundle.fingerprint !== undefined) {
			options.fingerprint = bundle.fingerprint;
		}
		assetManager.writeFile(bundle.target, code, options);
	};
}

// removes properties from object, returning their respective values
function extract(obj, ...props) {
	return props.map(prop => {
		let value = obj[prop];
		delete obj[prop];
		return value;
	});
}
