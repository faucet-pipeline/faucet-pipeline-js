"use strict";

let AssetManager = require("./manager");
let Bundle = require("./bundle");

module.exports = (config, referenceDir, { watcher, fingerprint, compact }) => {
	let { bundles, manifest } = config;

	let manifestPath, baseURI; // XXX: awkward
	if(manifest === false) {
		manifestPath = baseURI = false;
	} else {
		manifestPath = manifest.file;
		baseURI = manifest.baseURI;
	}
	let manager = new AssetManager(referenceDir, manifestPath, baseURI, {
		fingerprint: fingerprint,
		watchMode: !!watcher
	});

	bundles = bundles.map(bundleConfig => {
		bundleConfig = Object.assign({}, bundleConfig, { compact });
		let bundle = new Bundle(bundleConfig, referenceDir);

		bundle.generate(manager).
			catch(abort);

		return bundle;
	});

	watcher && watcher.on("edit", filepaths => {
		bundles.forEach(bundle => {
			bundle.rebuild(manager, ...filepaths).
				catch(abort);
		});
	});
};

function abort(err) {
	console.error("ERROR:", err);
	process.exit(1);
}
