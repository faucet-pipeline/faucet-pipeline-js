"use strict";

let path = require("path");

module.exports = {
	js: [{
		source: "./src/index.jsx",
		target: "./dist/bundle.js",
		transpiler: {
			features: ["esnext", "jsx"],
			jsx: { pragma: "createElement" }
		}
	}],
	plugins: {
		js: path.resolve(__dirname, "../../..")
	}
};
