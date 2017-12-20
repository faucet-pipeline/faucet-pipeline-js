"use strict";

let NOTIFY = '(typeof alert !== "undefined" ? alert : console.error)';

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
