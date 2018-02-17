"use strict";

let path = require("path");

module.exports = {
	js: [{
		source: "./src/foo.js",
		target: "./dist/foo.js"
	}, {
		source: "./src/bar.js",
		target: "./dist/bar.js",
		esnext: true
	}],
	manifest: {
		file: "./dist/manifest.json",
		value: bundlePath => assetURI(bundlePath)
	},
	plugins: {
		js: path.resolve(__dirname, "../../..")
	}
};

function assetURI(filepath) {
	let filename = path.basename(filepath);
	return `/assets/${filename}`;
}
