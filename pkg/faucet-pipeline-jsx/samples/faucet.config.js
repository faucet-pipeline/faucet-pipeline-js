"use strict";

module.exports = {
	js: [{
		source: "./src/index.js",
		target: "./dist/bundle.js",
		jsx: { pragma: "createElement" }
	}]
};
