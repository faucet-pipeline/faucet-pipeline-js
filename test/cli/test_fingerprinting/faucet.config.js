"use strict";

let path = require("path");

module.exports = {
	js: [{
		source: "./src/index.js",
		target: "./dist/bundle.js"
	}, {
		source: "./src/index.js",
		target: "./dist/bundle_alt.js",
		fingerprint: false
	}],
	plugins: {
		js: path.resolve(__dirname, "../../..")
	}
};
