"use strict";

let AssetManager = require("faucet-pipeline/lib/manager");
let path = require("path");
let assert = require("assert");

let assertSame = assert.strictEqual;

exports.FIXTURES_DIR = path.resolve(__dirname, "fixtures");

exports.MockAssetManager = class MockAssetManager extends AssetManager {
	constructor(...args) {
		super(...args);
		this._writes = [];
	}

	writeFile(filepath, data, error) {
		console.log(`~~~~ writing ${filepath}`);
		this._writes.push({ filepath, content: data });
		return new Promise(resolve => {
			console.log(`~~~~ done writing ${filepath}`);
			setTimeout(_ => resolve(), 1);
		});
	}

	assertWrites(expected) {
		let actual = this._writes;
		console.log(`~~~~ asserting ${actual.length} === ${expected.length}`);
		assertSame(actual.length, expected.length);
		actual.forEach((op, i) => {
			let { filepath, content } = expected[i];
			assertSame(op.filepath, filepath);
			assertSame(op.content, content);
		});
	}
};

// wraps given code in boilerplate
exports.makeBundle = function makeBundle(code) {
	return `
(function () {
'use strict';

if(typeof global === "undefined" && typeof window !== "undefined") {
	window.global = window;
}

${code}

}());
	`.trim() + "\n";
};

// returns a function that invokes `callback` only after having itself been
// invoked `total` times
exports.awaitInvocations = function awaitAll(total, callback) {
	let i = 0;
	return _ => {
		i++;
		if(i === total) {
			callback();
		}
	};
};
