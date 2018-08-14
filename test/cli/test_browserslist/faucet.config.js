"use strict";

let path = require("path");

module.exports = {
	js: [{
		source: "./src/index.js",
		target: "./dist/bundle.js",
		esnext: true
	}, {
		source: "./src/index.js",
		target: "./dist/bundle_alt.js",
		esnext: {
			browserslist: false
		}
	}, {
		source: "./src/index.js",
		target: "./dist/bundle_legacy.js",
		esnext: {
			browserslist: "legacy"
		}
	}],
	plugins: {
		js: {
			package: path.resolve(__dirname, "../../.."),
			bucket: "scripts"
		}
	}
};
