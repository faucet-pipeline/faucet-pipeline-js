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
		target: "./dist/manifest.json",
		value: bundlePath => assetURI(bundlePath)
	},
	plugins: {
		js: {
			plugin: path.resolve(__dirname, "../../.."),
			bucket: "scripts"
		}
	}
};

function assetURI(filepath) {
	let filename = path.basename(filepath);
	return `/assets/${filename}`;
}
