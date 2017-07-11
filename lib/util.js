"use strict";

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
