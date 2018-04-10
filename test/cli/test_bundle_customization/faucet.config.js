"use strict";

let path = require("path");

module.exports = {
	js: [{
		source: "./src/index.js",
		target: "./dist/bundle.js",
		format: "umd",
		exports: "MYLIB"
	}, {
		source: "./src/index.js",
		target: "./dist/bundle_cjs.js",
		format: "commonjs"
	}],
	plugins: {
		js: path.resolve(__dirname, "../../..")
	}
};
