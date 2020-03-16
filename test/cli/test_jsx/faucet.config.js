"use strict";

let path = require("path");

module.exports = {
	js: [{
		source: "./src/index.jsx",
		target: "./dist/bundle.js",
		esnext: true,
		jsx: {
			pragma: "createElement",
			fragment: "Fragment"
		}
	}],
	plugins: [path.resolve(__dirname, "../../..")]
};
