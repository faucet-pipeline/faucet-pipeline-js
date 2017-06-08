"use strict";

let crypto = require("crypto");

exports.generateError = err => {
	let msg = `ERROR: ${err.message}`;
	console.error(`✗ ${msg}`);
	return `alert("${msg.replace(/"/g, "\\\"")}");`;
};

exports.generateHash = str => {
	let hash = crypto.createHash("md5");
	hash.update(str);
	return hash.digest("hex");
};
