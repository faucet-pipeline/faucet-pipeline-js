"use strict";

let crypto = require("crypto");

exports.generateError = err => {
	let msg = `ERROR: ${err}`;
	console.error(`✗ ${msg}`);
	if(err.code) { // Rollup-augmented exception; emit in full detail
		console.error(err);

		let { url } = err;
		if(url) {
			console.error(`🔗 visit ${url} for details`);
		}
	}
	return `alert("${msg.replace(/"/g, "\\\"")}");`;
};

exports.generateHash = str => {
	let hash = crypto.createHash("md5");
	hash.update(str);
	return hash.digest("hex");
};
