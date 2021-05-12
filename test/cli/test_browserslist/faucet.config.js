"use strict";

let path = require("path");

module.exports = {
	js: [{
		source: "./src/index.js",
		target: "./dist/bundle.js",
		format: "esm",
		esnext: true
	}, {
		source: "./src/index.js",
		target: "./dist/bundle_alt.js",
		format: "esm",
		esnext: {
			browserslist: false
		}
	}, {
		source: "./src/index.js",
		target: "./dist/bundle_legacy.js",
		format: "esm",
		esnext: {
			browserslist: "legacy"
		}
	}],
	plugins: [path.resolve(__dirname, "../../..")]
};
