"use strict";

let path = require("path");

module.exports = {
	js: [{
		source: "./index.js",
		target: "./dist/bundle.js"
	}],
	manifest: {
		target: "./dist/manifest.json",
		value: filepath => `/assets/${filepath}`
	},
	plugins: {
		js: {
			package: path.resolve(__dirname, "../../.."),
			bucket: "scripts"
		}
	}
};
