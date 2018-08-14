"use strict";

let Bundle = require("./bundle");
let { abort, repr } = require("faucet-pipeline-core/lib/util");
let path = require("path");

module.exports = (config, assetManager, { browsers, compact, sourcemaps }) => {
	let bundles = config.map(bundleConfig => {
		// NB: bundle-specific configuration can override global options
		bundleConfig = Object.assign({ compact, sourcemap: sourcemaps }, bundleConfig);
		return makeBundle(bundleConfig, assetManager.resolvePath, { browsers });
	});

	return filepaths => {
		return Promise.all(bundles.map(bundle => {
			let writer = makeWriter(bundle, assetManager, {
				fingerprint: bundle.fingerprint
			});

			let res = filepaths ? bundle.recompile(...filepaths) : bundle.compile();

			// empty changes will not be written
			return res && res.then(writer);
		}));
	};
};

function makeWriter(bundle, assetManager, { fingerprint }) {
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
