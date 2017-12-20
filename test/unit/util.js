"use strict";

let AssetManager = require("../../lib/manager");

exports.MockAssetManager = class MockAssetManager extends AssetManager {
	constructor(...args) {
		super(...args);
		this.writes = [];
	}

	writeFile(filepath, content) {
		this.writes.push({ filepath, content });
		return new Promise(resolve => {
			setTimeout(_ => resolve(), 1);
		});
	}
};
