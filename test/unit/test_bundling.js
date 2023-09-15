/* global describe, it, beforeEach, afterEach */
"use strict";

let { MockAssetManager, makeBundle, FIXTURES_DIR } = require("./util");
let faucetJS = require("../../lib").plugin;
const fs = require("fs");
let path = require("path");
let assert = require("assert");

let DEFAULT_OPTIONS = {
	browsers: {}
};

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

	it("should optionally transpile ES6 to ES5", () => {
		let config = [{
			source: "./src/index.js",
			target: "./dist/bundle.js",
			esnext: true
		}];
		let assetManager = new MockAssetManager(FIXTURES_DIR);

		return faucetJS(config, assetManager, DEFAULT_OPTIONS)().
			then(_ => {
				assetManager.assertWrites([{
					filepath: path.resolve(FIXTURES_DIR, "./dist/bundle.js"),
					content: makeBundle(`
var util = "UTIL";

console.log("[\\u2026] ".concat(util)); // eslint-disable-line no-console
					`)
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
			esnext: {
				exclude: ["my-lib"]
			}
		}];
		let assetManager = new MockAssetManager(FIXTURES_DIR);

		return faucetJS(config, assetManager, DEFAULT_OPTIONS)().
			then(restore, restore). // XXX: hacky
			then(_ => {
				assetManager.assertWrites([{
					filepath: path.resolve(FIXTURES_DIR, "./dist/bundle.js"),
					/* eslint-disable max-len */
					content: makeBundle(`
var distExports = {};
var dist = {
  get exports(){ return distExports; },
  set exports(v){ distExports = v; },
};

/* eslint-disable */

(function (module) {
	(function(window) {

	var MYLIB = "MY-LIB";

	{
		module.exports = MYLIB;
	}

	}());
} (dist));

var MYLIB = distExports;

console.log("[\\u2026] ".concat(MYLIB)); // eslint-disable-line no-console
					`)
					/* eslint-enable max-len */
				}]);
			});
	});

	it("should support customizing bundle's API", () => {
		let config = [{
			source: "./src/lib.js",
			target: "./dist/bundle.js",
			exports: "MYLIB"
		}];
		let assetManager = new MockAssetManager(FIXTURES_DIR);

		return faucetJS(config, assetManager, DEFAULT_OPTIONS)().
			then(_ => {
				assetManager.assertWrites([{
					filepath: path.resolve(FIXTURES_DIR, "./dist/bundle.js"),
					content: makeBundle(`
var util = "UTIL";

var lib = msg => {
	console.log(\`[…] $\{util} $\{msg}\`); // eslint-disable-line no-console
};

export { lib as default };
					`)
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

		return faucetJS(config, assetManager, DEFAULT_OPTIONS)().
			then(_ => {
				assetManager.assertWrites([{
					filepath: path.resolve(FIXTURES_DIR, "./dist/bundle.js"),
					content: makeBundle(`
define((function () { 'use strict';

var util = "UTIL";

var lib = msg => {
	console.log(\`[…] $\{util} $\{msg}\`); // eslint-disable-line no-console
};

return lib;

}));
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

	it("should take into account Browserslist while transpiling", () => {
		let config = [{
			source: "./src/index.js",
			target: "./dist/bundle.js",
			esnext: true
		}];
		let assetManager = new MockAssetManager(FIXTURES_DIR);

		let browsers = { defaults: ["Chrome 63"] };
		return faucetJS(config, assetManager, { browsers })().
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

	it("should allow suppressing Browserslist auto-config while transpiling", () => {
		let config = [{
			source: "./src/index.js",
			target: "./dist/bundle.js",
			esnext: {
				browserslist: false
			}
		}];
		let assetManager = new MockAssetManager(FIXTURES_DIR);

		let browsers = { defaults: ["Chrome 63"] };
		return faucetJS(config, assetManager, { browsers })().
			then(_ => {
				assetManager.assertWrites([{
					filepath: path.resolve(FIXTURES_DIR, "./dist/bundle.js"),
					content: makeBundle(`
var util = "UTIL";

console.log("[\\u2026] ".concat(util)); // eslint-disable-line no-console
					`)
				}]);
			});
	});

	it("should allow specifying an alternative Browserslist group", () => {
		let config = [{
			source: "./src/index.js",
			target: "./dist/bundle.js",
			esnext: {
				browserslist: "modern"
			}
		}];
		let assetManager = new MockAssetManager(FIXTURES_DIR);

		let browsers = {
			defaults: ["IE 11"],
			modern: ["Chrome 63"]
		};
		return faucetJS(config, assetManager, { browsers })().
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

	it("should optionally compact bundle", () => {
		let config = [{
			source: "./src/multiline.js",
			target: "./dist/bundle.js"
		}];
		let assetManager = new MockAssetManager(FIXTURES_DIR);

		let options = { browsers: {}, compact: true };
		return faucetJS(config, assetManager, options)().
			then(_ => {
				assetManager.assertWrites([{
					filepath: path.resolve(FIXTURES_DIR, "./dist/bundle.js"),
					content: makeBundle(`let txt = \`foo

bar\`;
console.log(\`[…] $\{txt}\`);
					`, { compact: true })
				}]);

				config[0].esnext = true;
				assetManager = new MockAssetManager(FIXTURES_DIR);
				return faucetJS(config, assetManager, options)();
			}).
			then(_ => {
				assetManager.assertWrites([{
					filepath: path.resolve(FIXTURES_DIR, "./dist/bundle.js"),
					content: makeBundle(`
var txt = "foo\\n\\nbar";
console.log("[\\u2026] ".concat(txt));
					`, { compact: true })
				}]);

				config[0].compact = false; // overrides global option
				assetManager = new MockAssetManager(FIXTURES_DIR);
				return faucetJS(config, assetManager, options)();
			}).
			then(_ => {
				assetManager.assertWrites([{
					filepath: path.resolve(FIXTURES_DIR, "./dist/bundle.js"),
					content: makeBundle(`
var txt = "foo\\n\\nbar";
console.log("[\\u2026] ".concat(txt)); // eslint-disable-line no-console
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

	describe("working with linked modules", () => {
		// in case some set this env variable before
		let initialFlagValue = process.env.FAUCET_EXPERIMENTAL_SYMLINKS;

		beforeEach(() => {
			fs.symlinkSync(
					path.resolve(FIXTURES_DIR, "./external/cjs-module"),
					path.resolve(FIXTURES_DIR, "./node_modules/some-cjs-module"),
					"dir"
			);

			process.env.FAUCET_EXPERIMENTAL_SYMLINKS = "true";
		});

		afterEach(() => {
			fs.unlinkSync(path.resolve(FIXTURES_DIR, "./node_modules/some-cjs-module"));
			process.env.FAUCET_EXPERIMENTAL_SYMLINKS = initialFlagValue;
		});

		it("should preserve symlinks when env varialbe is set", () => {
			let config = [{
				source: "./src/import-symlinked.js",
				target: "./dist/bundle.js",
				format: "CommonJS"
			}];
			let assetManager = new MockAssetManager(FIXTURES_DIR);

			return faucetJS(config, assetManager, DEFAULT_OPTIONS)().
				then(() => {
					assetManager.assertWrites([{
						filepath: path.resolve(FIXTURES_DIR, "./dist/bundle.js"),
						content: makeBundle(`
'use strict';

var dummy = {
	some: "dummy value"
};

console.log(dummy); // eslint-disable-line no-console
`)
					}]);
				});
		});
	});
});
