"use strict";

let path = require("path");

module.exports = {
	js: [{
		source: "./index.js",
		target: "./dist/bundle.js"
	}],
	plugins: {
		js: {
			plugin: path.resolve(__dirname, "../../.."),
			bucket: "scripts"
		}
	}
};
