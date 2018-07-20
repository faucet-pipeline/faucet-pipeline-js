"use strict";

let { abort, repr } = require("faucet-pipeline-core/lib/util");

let NOTIFY = '(typeof alert !== "undefined" ? alert : console.error)';

exports.requireOptional = function requireOptional(pkg, errorMessage, supplier = pkg) {
	try {
		return require(pkg);
	} catch(err) {
		abort(`${errorMessage} - please install ${repr(supplier)}`);
	}
};

exports.generateError = err => {
	let msg = `ERROR: ${err}`;
	console.error(`✗ ${msg}`);
	if(err.code) { // Rollup-augmented exception; emit in full detail
		if(err.codeFrame) { // excerpt, provided by Babel
			reportCodeFrame(err, "codeFrame");
		} else if(err.frame) { // excerpt, provided by Rollup
			reportCodeFrame(err, "frame");
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

function reportCodeFrame(err, prop) {
	let frame = err[prop];
	delete err[prop];
	console.error(err);
	console.error(`\n${frame}\n`);
}
