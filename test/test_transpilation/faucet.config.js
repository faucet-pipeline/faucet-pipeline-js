"use strict";

let config = {
	manifest: false,
	bundles: [{
		entryPoint: "src/index.js",
		target: "dist/bundle.js",
		transpiler: {
			features: ["es2015"]
		}
	}]
};

module.exports = {
	js: config
};
