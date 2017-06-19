"use strict";

let fs = require("fs");
let crypto = require("crypto");

// TODO: human-friendly error reporting
exports.readConfig = (filepath, property) => {
	let json = fs.readFileSync(filepath);
	let config = JSON.parse(json);
	return config[property];
};

exports.generateError = err => {
	let msg = `ERROR: ${err}`;
	console.error(`✗ ${msg}`);
	if(err.code) { // Rollup-augmented exception; emit in full detail
		console.error(err);
	}
	return `alert("${msg.replace(/"/g, "\\\"")}");`;
};

exports.generateHash = str => {
	let hash = crypto.createHash("md5");
	hash.update(str);
	return hash.digest("hex");
};

// adapted from uitil <https://github.com/FND/uitil>
exports.debounce = function(delay, fn) {
	let timer;
	return function() {
		let args = arguments;
		if(timer) {
			clearTimeout(timer);
			timer = null;
		}
		timer = setTimeout(_ => {
			fn.apply(null, args);
			timer = null;
		}, delay);
	};
};
