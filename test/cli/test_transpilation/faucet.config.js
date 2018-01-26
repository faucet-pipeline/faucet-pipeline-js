"use strict";

let path = require("path");

module.exports = {
	js: [{
		source: "./src/index.js",
		target: "./dist/bundle.js",
		transpiler: {
			features: ["esnext"]
		}
	}],
	plugins: {
		js: path.resolve(__dirname, "../../..")
	}
};
