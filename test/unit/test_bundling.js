/* global describe, it */
"use strict";

let { MockAssetManager, makeBundle, FIXTURES_DIR } = require("./util");
let faucetJS = require("../../lib");
let path = require("path");
let assert = require("assert");

describe("bundling", _ => {
	it("should combine ES6 modules into a bundle", () => {
		let config = [{
			entryPoint: "./src/index.js",
			target: "./dist/bundle.js"
		}];
		let manager = new MockAssetManager(FIXTURES_DIR);

		return faucetJS(config, manager).
			then(_ => {
				manager.assertWrites([{
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
		let manager = new MockAssetManager(FIXTURES_DIR);

		return faucetJS(config, manager).
			then(_ => {
				manager.assertWrites([{
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
			entryPoint: "./src/index.js",
			target: "./dist/bundle.js"
		}];
		let manager = new MockAssetManager(FIXTURES_DIR);

		return faucetJS(config, manager, { compact: true }).
			then(_ => {
				manager.assertWrites([{
					filepath: path.resolve(FIXTURES_DIR, "./dist/bundle.js"),
					content: makeBundle(`
var util = "UTIL";

console.log(\`[…] $\{util}\`);
					`.trim())
				}]);

				config[0].transpiler = {
					features: ["es2015"]
				};
				manager = new MockAssetManager(FIXTURES_DIR);
				return faucetJS(config, manager, { compact: true });
			}).
			then(_ => {
				manager.assertWrites([{
					filepath: path.resolve(FIXTURES_DIR, "./dist/bundle.js"),
					content: makeBundle(`
var util = "UTIL";

console.log("[\\u2026] " + util);
					`.trim())
				}]);

				config[0].compact = false; // overrides global option
				manager = new MockAssetManager(FIXTURES_DIR);
				return faucetJS(config, manager, { compact: true });
			}).
			then(_ => {
				manager.assertWrites([{
					filepath: path.resolve(FIXTURES_DIR, "./dist/bundle.js"),
					content: makeBundle(`
var util = "UTIL";

console.log("[\\u2026] " + util); // eslint-disable-line no-console
					`.trim())
				}]);
			});
	});

	it("should balk at non-relative paths in config", () => {
		let manager = new MockAssetManager(FIXTURES_DIR);
		let entryPoint = "src/index.js";
		let target = "dist/bundle.js";
		let compile = (entryPoint, target) => faucetJS([{ entryPoint, target }], manager);

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
		let manager = new MockAssetManager(FIXTURES_DIR);
		let compile = (entryPoint, target) => faucetJS([{ entryPoint, target }], manager);

		return compile(entryPoint, target).
			then(_ => {
				manager.assertWrites([{
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
