"use strict";

let path = require("path");

module.exports = {
	js: [{
		source: "./index.js",
		target: "./dist/bundle.js"
	}],
	plugins: [path.resolve(__dirname, "../../..")]
};
