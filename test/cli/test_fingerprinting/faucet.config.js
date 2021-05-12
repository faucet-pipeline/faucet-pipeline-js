"use strict";

let path = require("path");

module.exports = {
	js: [{
		source: "./src/index.js",
		target: "./dist/bundle.js",
		format: "esm"
	}, {
		source: "./src/index.js",
		target: "./dist/bundle_alt.js",
		format: "esm",
		fingerprint: false
	}],
	plugins: [path.resolve(__dirname, "../../..")]
};
