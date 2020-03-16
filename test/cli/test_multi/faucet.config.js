"use strict";

let path = require("path");

module.exports = {
	js: [{
		source: "./src/foo.js",
		target: "./dist/foo.js"
	}, {
		source: "./src/bar.js",
		target: "./dist/bar.js",
		esnext: true
	}],
	manifest: {
		target: "./dist/manifest.json",
		value: filepath => `/assets/${filepath}`
	},
	plugins: [path.resolve(__dirname, "../../..")]
};
