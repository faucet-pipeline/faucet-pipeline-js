/* global describe, it */
"use strict";

let { DummyAssetManager } = require("./util");
let faucetJS = require("../../lib/reboot");
let path = require("path");
let assert = require("assert");

const FIXTURES_DIR = path.resolve(__dirname, "fixtures");
const EXPECTED_BUNDLE = `
(function () {
'use strict';

if(typeof global === "undefined" && typeof window !== "undefined") {
	window.global = window;
}

var util = "UTIL";

console.log(\`[…] $\{util}\`);

}());
`.trim() + "\n";

describe("bundling", _ => {
	it("should invoke callback only after the specified number of invocations", done => {
		let config = [{
			entryPoint: "./src/index.js",
			target: "./dist/bundle.js"
		}];

		let assman = new DummyAssetManager(FIXTURES_DIR);
		faucetJS(config, assman);

		setTimeout(_ => { // FIXME: hacky
			let { writes } = assman;
			assert.equal(writes.length, 1);
			let { filepath, content } = writes[0];
			assert.equal(filepath, path.resolve(FIXTURES_DIR, "./dist/bundle.js"));
			assert.equal(content, EXPECTED_BUNDLE);
			done();
		}, 100);
	});
});
