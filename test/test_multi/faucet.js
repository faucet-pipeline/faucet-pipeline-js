"use strict";

let config = {
	manifest: {
		file: "dist/manifest.json",
		baseURI: "/assets"
	},
	bundles: [{
		entryPoint: "src/foo.js",
		target: "dist/foo.js"
	}, {
		entryPoint: "src/bar.js",
		target: "dist/bar.js",
		transpiler: {
			features: ["es2015"]
		}
	}]
};

module.exports = {
	js: config
};
