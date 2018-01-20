"use strict";

let path = require("path");

module.exports = {
	js: [{
		entryPoint: "./index.js",
		target: "./dist/bundle.js"
	}],
	manifest: {
		file: "./dist/manifest.json",
		value: filepath => `/assets/${filepath}`
	},
	plugins: {
		js: path.resolve(__dirname, "../../..")
	}
};
