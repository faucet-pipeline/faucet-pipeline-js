"use strict";

let path = require("path");

module.exports = {
	js: [{
		source: "./src/index.js",
		target: "./dist/bundle.js",
		compact: "mangle"
	}],
	plugins: [path.resolve(__dirname, "../../..")]
};
