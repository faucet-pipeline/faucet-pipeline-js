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

	it("should support skipping transpilation for select packages", () => {
		let cwd = process.cwd();
		process.chdir(FIXTURES_DIR); // XXX: should not be test-specific!?
		let restore = _ => process.chdir(cwd);

		let config = [{
			source: "./src/alt2.js",
			target: "./dist/bundle.js",
			transpiler: {
				features: ["es2015"],
				exclude: ["my-lib"]
			}
		}];
		let assetManager = new MockAssetManager(FIXTURES_DIR);

		return faucetJS(config, assetManager).
			then(restore, restore). // XXX: hacky
			then(_ => {
				assetManager.assertWrites([{
					filepath: path.resolve(FIXTURES_DIR, "./dist/bundle.js"),
					/* eslint-disable max-len */
					content: makeBundle(`
var commonjsGlobal = typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

var dist = createCommonjsModule(function (module) {
/* eslint-disable */
(function(window) {

var MYLIB = "MY-LIB";

{
	module.exports = MYLIB;
}

}(commonjsGlobal));
});

console.log("[\\u2026] " + dist); // eslint-disable-line no-console
					`.trim())
					/* eslint-enable max-len */
				}]);
			});
	});

	it("should support custom file extensions", () => {
		let config = [{
			source: "./src/index.coffee",
			target: "./dist/bundle.js",
			extensions: [".coffee"]
		}];
		let assetManager = new MockAssetManager(FIXTURES_DIR);

		return faucetJS(config, assetManager).
			then(_ => {
				assetManager.assertWrites([{
					filepath: path.resolve(FIXTURES_DIR, "./dist/bundle.js"),
					content: makeBundle(`
var helper = { foo: "lorem", bar: "ipsum" };

console.log(\`[…] $\{helper}\`); // eslint-disable-line no-console
					`.trim())
				}]);
			});
	});

	it("should support customizing bundle's API", () => {
		let config = [{
			source: "./src/lib.js",
			target: "./dist/bundle.js",
			moduleName: "MYLIB"
		}];
		let assetManager = new MockAssetManager(FIXTURES_DIR);

		return faucetJS(config, assetManager).
			then(_ => {
				assetManager.assertWrites([{
					filepath: path.resolve(FIXTURES_DIR, "./dist/bundle.js"),
					content: "var MYLIB = " + makeBundle(`
var util = "UTIL";

var lib = msg => {
	console.log(\`[…] $\{util} $\{msg}\`); // eslint-disable-line no-console
};

return lib;
					`.trim())
				}]);
			});
	});

	it("should support customizing bundle format", () => {
		let config = [{
			source: "./src/lib.js",
			target: "./dist/bundle.js",
			format: "amd"
		}];
		let assetManager = new MockAssetManager(FIXTURES_DIR);

		return faucetJS(config, assetManager).
			then(_ => {
				assetManager.assertWrites([{
					filepath: path.resolve(FIXTURES_DIR, "./dist/bundle.js"),
					content: `
define(function () { 'use strict';

if(typeof global === "undefined" && typeof window !== "undefined") {
	window.global = window;
}

var util = "UTIL";

var lib = msg => {
	console.log(\`[…] $\{util} $\{msg}\`); // eslint-disable-line no-console
};

return lib;

});
					`.trim() + "\n"
				}]);
			});
	});

	it("should support importing third-party packages", () => {
		let config = [{
			source: "./src/alt.js",
			target: "./dist/bundle.js"
		}];
		let assetManager = new MockAssetManager(FIXTURES_DIR);

		return faucetJS(config, assetManager).
			then(_ => {
				assetManager.assertWrites([{
					filepath: path.resolve(FIXTURES_DIR, "./dist/bundle.js"),
					content: makeBundle(`
var MYLIB = "MY-LIB";

console.log(\`[…] $\{MYLIB}\`); // eslint-disable-line no-console
					`.trim())
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

		return faucetJS(config, assetManager).
			then(_ => {
				assetManager.assertWrites([{
					filepath: path.resolve(FIXTURES_DIR, "./dist/bundle.js"),
					content: `
(function (MYLIB) {
'use strict';

if(typeof global === "undefined" && typeof window !== "undefined") {
	window.global = window;
}

MYLIB = MYLIB && MYLIB.hasOwnProperty('default') ? MYLIB['default'] : MYLIB;

console.log(\`[…] $\{MYLIB}\`); // eslint-disable-line no-console

}(MYLIB));
					`.trim() + "\n"
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

	it("should balk at non-relative paths for target", () => {
		let assetManager = new MockAssetManager(FIXTURES_DIR);
		let entryPoint = "src/index.js";
		let target = "dist/bundle.js";
		let compile = (source, target) => faucetJS([{ source, target }], assetManager);

		let fn = _ => compile(`./${entryPoint}`, target);
		assert.throws(fn, /path must be relative/);

		// non-relative path is acceptable for entry point, but a suitable
		// package path does not exist
		fn = _ => compile("dummy/src/does_not_exist.js", `./${target}`);
		assert.throws(fn, /could not resolve/);

		return compile(`./${entryPoint}`, `./${target}`);
	});

	it("should support Node resolution algorithm for entry point", () => {
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
