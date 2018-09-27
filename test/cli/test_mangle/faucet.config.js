"use strict";

let path = require("path");

module.exports = {
	js: [{
		source: "./src/index.js",
		target: "./dist/bundle.js",
		compact: "mangle"
	}],
	plugins: {
		js: {
			plugin: path.resolve(__dirname, "../../.."),
			bucket: "scripts"
		}
	}
};
