"use strict";

let Bundle = require("./bundle");

class FileManager { // XXX: temporary placeholder
	write(content, filepath) {
		console.log("~~~~ [WRITE]", filepath);
		console.log(content);
		console.log("----");
		return new Promise(resolve => {
			setTimeout(_ => resolve, 10);
		});
	}
}

module.exports = (config, referenceDir, { watcher, fingerprint, compact }) => {
	// `config` is either an array of bundles or a configuration object
	// containing said array (for backwards compatibility as well as extensibility)
	// FIXME: YAGNI
	let bundles = config.pop ? config : config.bundles;

	let manager = new FileManager();

	bundles = bundles.map(bundleConfig => {
		bundleConfig = Object.assign({}, bundleConfig, { compact });
		let bundle = new Bundle(bundleConfig, referenceDir);

		bundle.compile().
			then(({ code, error }) => manager.write(code, bundle.target)).
			catch(manager.abort);

		return bundle;
	});

	watcher && watcher.on("edit", filepaths => {
		bundles.forEach(bundle => {
			let res = bundle.recompile(...filepaths);
			if(!res) { // no relevant change -- XXX: awkward API
				return;
			}

			res.then(({ code, error }) => {
					return manager.write(res, bundle.target);
				}).
				catch(manager.abort);
		});
	});
};

function abort(err) {
	console.error("ERROR:", err);
	process.exit(1);
}
