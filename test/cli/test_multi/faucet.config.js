"use strict";

let path = require("path");

module.exports = {
	js: [{
		source: "./src/foo.js",
		target: "./dist/foo.js"
	}, {
		source: "./src/bar.js",
		target: "./dist/bar.js",
		transpiler: {
			features: ["es2015"]
		}
	}],
	manifest: {
		file: "./dist/manifest.json",
		value: filepath => `/assets/${filepath}`
	},
	plugins: {
		js: path.resolve(__dirname, "../../..")
	}
};
