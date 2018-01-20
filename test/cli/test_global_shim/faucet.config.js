"use strict";

let path = require("path");

module.exports = {
	js: [{
		entryPoint: "./index.js",
		target: "./dist/bundle.js"
	}],
	plugins: {
		js: path.resolve(__dirname, "../../..")
	}
};
