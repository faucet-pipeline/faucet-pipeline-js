"use strict";

let path = require("path");

module.exports = {
	js: [{
		source: "./index.js",
		target: "./dist/bundle.js",
		reporting: {
			threshold: 100
		}
	}],
	plugins: {
		js: path.resolve(__dirname, "../../..")
	}
};
