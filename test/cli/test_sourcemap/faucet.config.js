"use strict";

let path = require("path");

module.exports = {
	js: [{
		source: "./src/index.js",
		target: "./dist/bundle.js"
	}, {
		source: "./src/index.js",
		target: "./dist/bundle_esnext.js",
		esnext: true
	}],
	plugins: [path.resolve(__dirname, "../../..")]
};
