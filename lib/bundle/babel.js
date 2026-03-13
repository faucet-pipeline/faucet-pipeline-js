"use strict";

let { loadExtension } = require("faucet-pipeline-core/lib/util");

module.exports = async function generateTranspiler({ jsx }) {
	let settings = {
		babelHelpers: "bundled"
	};
	let plugins = [];

	if(jsx) {
		let { pragma, pragmaFrag } = jsx;
		plugins.push(["@babel/plugin-transform-react-jsx",
			{ pragma, pragmaFrag }]);
	}

	if(plugins.length) {
		settings.plugins = plugins;
	}

	let babel = await loadExtension("@rollup/plugin-babel",
			"failed to activate ESNext transpiler", "faucet-pipeline-jsx");
	return babel.default(settings);
};
