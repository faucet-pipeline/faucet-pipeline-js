"use strict";

let { loadExtension } = require("faucet-pipeline-core/lib/util");

module.exports = function generateTranspiler({ esnext, jsx, exclude }, { browsers }) {
	let settings = {
		babelHelpers: "bundled"
	};
	let plugins = [];

	if(exclude) {
		settings.exclude = exclude.map(pkg => {
			// distinguish paths from package identifiers - as per Node's
			// resolution algorithm <https://nodejs.org/api/modules.html>, a
			// string is a path if it begins with `/`, `./` or `../`
			// FIXME: duplicates faucet-core's `resolvePath`, resulting in
			//        inconsistency WRT working directory
			return /^\.{0,2}\//.test(pkg) ? pkg : `node_modules/${pkg}/**`;
		});
	}

	if(esnext) {
		settings.presets = [
			["@babel/preset-env", {
				modules: false,
				targets: {
					browsers: browsers || []
				}
			}]
		];
	}

	if(jsx) {
		let { pragma, pragmaFrag } = jsx;
		plugins.push(["@babel/plugin-transform-react-jsx",
			{ pragma, pragmaFrag }]);
	}

	if(plugins.length) {
		settings.plugins = plugins;
	}

	let babel = loadExtension("@rollup/plugin-babel",
			"failed to activate ESNext transpiler", "faucet-pipeline-esnext");
	return {
		plugin: babel.default(settings)
	};
};
