/* global describe, it */
"use strict";

let { MockAssetManager } = require("./util");
let faucetJS = require("../../lib");
let path = require("path");
let assert = require("assert");

let assertSame = assert.strictEqual;

const FIXTURES_DIR = path.resolve(__dirname, "fixtures");

describe("bundling", _ => {
	it("should combine ES6 modules into a bundle", () => {
		let config = [{
			entryPoint: "./src/index.js",
			target: "./dist/bundle.js"
		}];
		let assman = new MockAssetManager(FIXTURES_DIR);

		return faucetJS(config, assman).
			then(_ => {
				assertWrites(assman.writes, [{
					filepath: path.resolve(FIXTURES_DIR, "./dist/bundle.js"),
					content: makeBundle(`
var util = "UTIL";

console.log(\`[…] $\{util}\`); // eslint-disable-line no-console
					`.trim())
				}]);
			});
	});

	it("should optionally transpile ES6 to ES5", () => {
		let config = [{
			entryPoint: "./src/index.js",
			target: "./dist/bundle.js",
			transpiler: {
				features: ["es2015"]
			}
		}];
		let assman = new MockAssetManager(FIXTURES_DIR);

		return faucetJS(config, assman).
			then(_ => {
				assertWrites(assman.writes, [{
					filepath: path.resolve(FIXTURES_DIR, "./dist/bundle.js"),
					content: makeBundle(`
var util = "UTIL";

console.log("[\\u2026] " + util); // eslint-disable-line no-console
					`.trim())
				}]);
			});
	});

	it("should balk at non-relative paths in config", () => {
		let assman = new MockAssetManager(FIXTURES_DIR);
		let entryPoint = "src/index.js";
		let target = "dist/bundle.js";
		let compile = (entryPoint, target) => faucetJS([{ entryPoint, target }], assman);

		let fn = _ => compile(entryPoint, target);
		assert.throws(fn, /path must be relative/);

		fn = _ => compile(`./${entryPoint}`, target);
		assert.throws(fn, /path must be relative/);

		return compile(`./${entryPoint}`, `./${target}`);
	});

	it("should support Node resolution algorithm for entry point", () => {
		let entryPoint = "dummy/src/index.js";
		let target = "./dist/bundle.js";
		let assman = new MockAssetManager(FIXTURES_DIR);
		let compile = (entryPoint, target) => faucetJS([{ entryPoint, target }], assman);

		return compile(entryPoint, target).
			then(_ => {
				assertWrites(assman.writes, [{
					filepath: path.resolve(FIXTURES_DIR, "./dist/bundle.js"),
					content: makeBundle(`
var util = "DUMMY-UTIL";

console.log(\`[DUMMY] $\{util}\`); // eslint-disable-line no-console
					`.trim())
				}]);

				let fn = _ => compile("dummy/src/does_not_exist.js", target);
				assert.throws(fn, /could not resolve/);

				fn = _ => compile(entryPoint, "dist/bundle.js");
				assert.throws(fn, /path must be relative/);
			});
	});
});

function makeBundle(js) {
	return `
(function () {
'use strict';

if(typeof global === "undefined" && typeof window !== "undefined") {
	window.global = window;
}

${js}

}());
	`.trim() + "\n";
}

function assertWrites(actual, expected) {
	assertSame(actual.length, expected.length);
	actual.forEach((op, i) => {
		let { filepath, content } = expected[i];
		assertSame(op.filepath, filepath);
		assertSame(op.content, content);
	});
}
