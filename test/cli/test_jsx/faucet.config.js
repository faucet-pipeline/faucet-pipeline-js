"use strict";

let path = require("path");

module.exports = {
	js: [{
		source: "./src/index.jsx",
		target: "./dist/bundle.js",
		esnext: true,
		jsx: { pragma: "createElement" }
	}],
	plugins: {
		js: {
			package: path.resolve(__dirname, "../../.."),
			bucket: "scripts"
		}
	}
};
