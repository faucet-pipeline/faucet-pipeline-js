"use strict";
let { MockAssetManager, makeBundle, FIXTURES_DIR } = require("./util");
let faucetJS = require("../../lib").plugin;
let { describe, it, beforeEach, afterEach } = require("node:test");
let path = require("node:path");
let assert = require("node:assert");

let DEFAULT_OPTIONS = {};

describe("bundling", _ => {
	let { exit } = process;
	beforeEach(() => {
		process.exit = code => {
			throw new Error(`exit ${code}`);
		};
	});
	afterEach(() => {
		process.exit = exit;
	});

	it("should verify configuration", () => {
		let config = [{}];
		let assetManager = new MockAssetManager(FIXTURES_DIR);

		let fn = _ => faucetJS(config, assetManager, DEFAULT_OPTIONS)();
		assert.throws(fn, /exit 1/); // aborts with "missing `source` configuration"
		config[0].source = "./src/index.js";
		assert.throws(fn, /exit 1/); // aborts with "missing `target` configuration"
	});

	it("should combine ES6 modules into a bundle", () => {
		let config = [{
			source: "./src/index.js",
			target: "./dist/bundle.js"
		}];
		let assetManager = new MockAssetManager(FIXTURES_DIR);

		return faucetJS(config, assetManager, DEFAULT_OPTIONS)().
			then(_ => {
				assetManager.assertWrites([{
					filepath: path.resolve(FIXTURES_DIR, "./dist/bundle.js"),
					content: makeBundle(`
var util = "UTIL";

console.log(\`[…] $\{util}\`); // eslint-disable-line no-console
					`)
				}]);
			});
	});

	it("should support importing third-party packages", () => {
		let config = [{
			source: "./src/alt.js",
			target: "./dist/bundle.js"
		}];
		let assetManager = new MockAssetManager(FIXTURES_DIR);

		return faucetJS(config, assetManager, DEFAULT_OPTIONS)().
			then(_ => {
				assetManager.assertWrites([{
					filepath: path.resolve(FIXTURES_DIR, "./dist/bundle.js"),
					content: makeBundle(`
var MYLIB = "MY-LIB";

console.log(\`[…] $\{MYLIB}\`); // eslint-disable-line no-console
					`)
				}]);
			});
	});

	it("should support excluding module/package references", () => {
		let config = [{
			source: "./src/alt.js",
			target: "./dist/bundle.js",
			externals: { "my-lib": "MYLIB" }
		}];
		let assetManager = new MockAssetManager(FIXTURES_DIR);

		return faucetJS(config, assetManager, DEFAULT_OPTIONS)().
			then(_ => {
				assetManager.assertWrites([{
					filepath: path.resolve(FIXTURES_DIR, "./dist/bundle.js"),
					content: makeBundle(`
import MYLIB from 'my-lib';

console.log(\`[…] $\{MYLIB}\`); // eslint-disable-line no-console
					`)
				}]);
			});
	});

	it("should optionally compact bundle", () => {
		let config = [{
			source: "./src/multiline.js",
			target: "./dist/bundle.js"
		}];
		let assetManager = new MockAssetManager(FIXTURES_DIR);

		let options = { compact: true };
		return faucetJS(config, assetManager, options)().
			then(_ => {
				assetManager.assertWrites([{
					filepath: path.resolve(FIXTURES_DIR, "./dist/bundle.js"),
					content: makeBundle(`let txt = \`foo

bar\`;
console.log(\`[…] $\{txt}\`);
					`, { compact: true })
				}]);

				config[0].compact = false; // overrides global option
				assetManager = new MockAssetManager(FIXTURES_DIR);
				return faucetJS(config, assetManager, options)();
			}).
			then(_ => {
				assetManager.assertWrites([{
					filepath: path.resolve(FIXTURES_DIR, "./dist/bundle.js"),
					content: makeBundle(`let txt = \`foo

bar\`;

console.log(\`[…] $\{txt}\`); // eslint-disable-line no-console
					`)
				}]);
			});
	});

	it("should balk at non-relative paths for target", () => {
		let assetManager = new MockAssetManager(FIXTURES_DIR);
		let entryPoint = "src/index.js";
		let target = "dist/bundle.js";
		let compile = (source, target) => faucetJS([{ source, target }],
				assetManager, DEFAULT_OPTIONS)();

		let fn = _ => compile(`./${entryPoint}`, target);
		assert.throws(fn, /exit 1/); // aborts with "path must be relative"

		// non-relative path is acceptable for entry point, but a suitable
		// package path does not exist
		fn = _ => compile("dummy/src/does_not_exist.js", `./${target}`);
		assert.throws(fn, /exit 1/); // aborts with "could not resolve"

		return compile(`./${entryPoint}`, `./${target}`);
	});

	it("should support Node resolution algorithm for entry point", () => {
		let entryPoint = "dummy/src/index.js";
		let target = "./dist/bundle.js";
		let assetManager = new MockAssetManager(FIXTURES_DIR);
		let compile = (source, target) => faucetJS([{ source, target }],
				assetManager, DEFAULT_OPTIONS)();

		return compile(entryPoint, target).
			then(_ => {
				assetManager.assertWrites([{
					filepath: path.resolve(FIXTURES_DIR, "./dist/bundle.js"),
					content: makeBundle(`
var util = "DUMMY-UTIL";

console.log(\`[DUMMY] $\{util}\`); // eslint-disable-line no-console
					`)
				}]);

				let fn = _ => compile("dummy/src/does_not_exist.js", target);
				assert.throws(fn, /exit 1/); // aborts with "could not resolve"

				fn = _ => compile(entryPoint, "dist/bundle.js");
				assert.throws(fn, /exit 1/); // aborts with "path must be relative"
			});
	});

	it("should build when the provided path is part of the bundle", () => {
		let config = [{
			source: "./src/index.js",
			target: "./dist/bundle.js"
		}];
		let assetManager = new MockAssetManager(FIXTURES_DIR);
		let buildJS = faucetJS(config, assetManager, DEFAULT_OPTIONS);
		let relevantModule = path.join(FIXTURES_DIR, "src/util.js");

		return buildJS().
			then(_ => buildJS([relevantModule])).
			then(_ => {
				assetManager.assertWriteCount(2);
			});
	});

	it("should not build when the provided path is not part of the bundle", () => {
		let config = [{
			source: "./src/index.js",
			target: "./dist/bundle.js"
		}];
		let assetManager = new MockAssetManager(FIXTURES_DIR);
		let buildJS = faucetJS(config, assetManager, DEFAULT_OPTIONS);
		let unusedModule = path.join(FIXTURES_DIR, "src/alt.js");

		return buildJS().
			then(_ => buildJS([unusedModule])).
			then(_ => {
				assetManager.assertWriteCount(1);
			});
	});
});
