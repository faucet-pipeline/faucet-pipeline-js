/* global describe, it */
"use strict";

let { MockAssetManager, makeBundle, FIXTURES_DIR } = require("./util");
let faucetJS = require("../../lib");
let path = require("path");
let assert = require("assert");

describe("bundling", _ => {
	it("should combine ES6 modules into a bundle", () => {
		let config = [{
			source: "./src/index.js",
			target: "./dist/bundle.js"
		}];
		let assetManager = new MockAssetManager(FIXTURES_DIR);

		return faucetJS(config, assetManager).
			then(_ => {
				assetManager.assertWrites([{
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
			source: "./src/index.js",
			target: "./dist/bundle.js",
			transpiler: {
				features: ["es2015"]
			}
		}];
		let assetManager = new MockAssetManager(FIXTURES_DIR);

		return faucetJS(config, assetManager).
			then(_ => {
				assetManager.assertWrites([{
					filepath: path.resolve(FIXTURES_DIR, "./dist/bundle.js"),
					content: makeBundle(`
var util = "UTIL";

console.log("[\\u2026] " + util); // eslint-disable-line no-console
					`.trim())
				}]);
			});
	});

	it("should optionally compact bundle", () => {
		let config = [{
			source: "./src/index.js",
			target: "./dist/bundle.js"
		}];
		let assetManager = new MockAssetManager(FIXTURES_DIR);

		return faucetJS(config, assetManager, { compact: true }).
			then(_ => {
				assetManager.assertWrites([{
					filepath: path.resolve(FIXTURES_DIR, "./dist/bundle.js"),
					content: makeBundle(`
var util = "UTIL";

console.log(\`[…] $\{util}\`);
					`.trim())
				}]);

				config[0].transpiler = {
					features: ["es2015"]
				};
				assetManager = new MockAssetManager(FIXTURES_DIR);
				return faucetJS(config, assetManager, { compact: true });
			}).
			then(_ => {
				assetManager.assertWrites([{
					filepath: path.resolve(FIXTURES_DIR, "./dist/bundle.js"),
					content: makeBundle(`
var util = "UTIL";

console.log("[\\u2026] " + util);
					`.trim())
				}]);

				config[0].compact = false; // overrides global option
				assetManager = new MockAssetManager(FIXTURES_DIR);
				return faucetJS(config, assetManager, { compact: true });
			}).
			then(_ => {
				assetManager.assertWrites([{
					filepath: path.resolve(FIXTURES_DIR, "./dist/bundle.js"),
					content: makeBundle(`
var util = "UTIL";

console.log("[\\u2026] " + util); // eslint-disable-line no-console
					`.trim())
				}]);
			});
	});

	it("should balk at non-relative paths in config", () => {
		let assetManager = new MockAssetManager(FIXTURES_DIR);
		let entryPoint = "src/index.js";
		let target = "dist/bundle.js";
		let compile = (source, target) => faucetJS([{ source, target }], assetManager);

		let fn = _ => compile(entryPoint, target);
		assert.throws(fn, /path must be relative/);

		fn = _ => compile(`./${entryPoint}`, target);
		assert.throws(fn, /path must be relative/);

		return compile(`./${entryPoint}`, `./${target}`);
	});

	// NB: disabled while we're migrating old-style configurations
	it.skip("should support Node resolution algorithm for entry point", () => {
		let entryPoint = "dummy/src/index.js";
		let target = "./dist/bundle.js";
		let assetManager = new MockAssetManager(FIXTURES_DIR);
		let compile = (source, target) => faucetJS([{ source, target }], assetManager);

		return compile(entryPoint, target).
			then(_ => {
				assetManager.assertWrites([{
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
