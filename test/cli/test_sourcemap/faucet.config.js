"use strict";

let path = require("path");

module.exports = {
	js: [{
		source: "./src/index.js",
		target: "./dist/bundle.js",
		sourcemaps: true
	}, {
		source: "./src/index.js",
		target: "./dist/bundle-esnext.js",
		esnext: true,
		sourcemaps: true
	}],
	plugins: {
		js: path.resolve(__dirname, "../../..")
	}
};
