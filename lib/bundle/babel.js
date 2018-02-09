"use strict";

let { requireOptional } = require("../util");

module.exports = function generateTranspiler({ features = [], jsx, exclude }) {
	let settings = {};
	let plugins = [];
	let extensions = [];

	if(exclude) {
		settings.exclude = exclude.map(pkg => {
			// distinguish paths from package identifiers - as per Node's
			// resolution algorithm <https://nodejs.org/api/modules.html>, a
			// string is a path if it begins with `/`, `./` or `../`
			// FIXME: duplicates `AssetManager#resolvePath`, resulting in
			//        inconsistency WRT working directory
			return /^\.{0,2}\//.test(pkg) ? pkg : `node_modules/${pkg}/**`;
		});
	}

	if(features.includes("es2015")) {
		settings.presets = [
			["es2015", { modules: false }]
		];
		plugins.push("external-helpers");
	}

	if(features.includes("jsx")) {
		extensions.push(".jsx");
		plugins.push(["transform-react-jsx", jsx || {}]);
	}

	if(plugins.length) {
		settings.plugins = plugins;
	}

	let babel = requireOptional("rollup-plugin-babel",
			"failed to activate transpiler", "faucet-pipeline-esnext");
	return {
		plugin: babel(settings),
		extensions
	};
};
