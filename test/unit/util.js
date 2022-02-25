"use strict";

let AssetManager = require("faucet-pipeline-core/lib/manager");
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
		this._writes.push({ filepath, content: data });
		return new Promise(resolve => {
			setTimeout(_ => resolve(), 1);
		});
	}

	assertWriteCount(expected) {
		assertSame(this._writes.length, expected);
	}

	assertWrites(expected) {
		let actual = this._writes;
		assertSame(actual.length, expected.length);
		actual.forEach((op, i) => {
			let { filepath, content } = expected[i];
			assertSame(op.filepath, filepath);
			assertSame(op.content, content);
		});
	}
};

// adjust the whitespace around the given code
exports.makeBundle = function makeBundle(code, { compact } = {}) {
	return compact ? code.trim() : `${code.trim()}\n`;
};
