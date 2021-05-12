"use strict";

let path = require("path");

module.exports = {
	js: [{
		source: "./index.js",
		target: "./dist/bundle.js",
		format: "esm"
	}],
	plugins: [path.resolve(__dirname, "../../..")]
};
