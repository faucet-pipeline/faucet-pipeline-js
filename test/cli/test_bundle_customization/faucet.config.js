"use strict";

let path = require("path");

module.exports = {
	js: [{
		source: "./src/index.js",
		target: "./dist/bundle_umd.js",
		format: "umd",
		exports: "MYLIB"
	}, {
		source: "./src/index.js",
		target: "./dist/bundle_iife.js",
		format: "iife",
		exports: "MYLIB"
	}, {
		source: "./src/index.js",
		target: "./dist/bundle_cjs.js",
		format: "commonjs"
	}],
	plugins: [path.resolve(__dirname, "../../..")]
};
