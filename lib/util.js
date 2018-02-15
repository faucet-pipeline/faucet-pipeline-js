"use strict";

let { repr } = require("faucet-pipeline/lib/util");

let NOTIFY = '(typeof alert !== "undefined" ? alert : console.error)';

exports.requireOptional = function requireOptional(pkg, errorMessage, supplier = pkg) {
	try {
		return require(pkg);
	} catch(err) {
		throw new Error(`${errorMessage} - please install ${repr(supplier)}`);
	}
};

exports.generateError = err => {
	let msg = `ERROR: ${err}`;
	console.error(`✗ ${msg}`);
	if(err.code) { // Rollup-augmented exception; emit in full detail
		let { codeFrame } = err; // excerpt, provided by Babel
		if(codeFrame) {
			delete err.codeFrame;
			console.error(err);
			console.error(`\n${codeFrame}\n`);
		} else {
			console.error(err);
		}

		let { url } = err;
		if(url) {
			console.error(`🔗 visit ${url} for details`);
		}
	}
	return `${NOTIFY}("${msg.replace(/"/g, '\\"')}");`;
};
